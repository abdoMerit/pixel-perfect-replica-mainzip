#!/usr/bin/env node
/**
 * start-server.mjs
 *
 * Wraps the Cloudflare-module build (.output/server/index.mjs) in a plain
 * Node.js HTTP server so it runs on Render (or any Node host).
 *
 * The @lovable.dev/vite-tanstack-config package hard-codes the nitro preset
 * to "cloudflare-module", so the production build always exports a CF-style
 * { fetch(req, env, ctx) } handler.  This script bridges that to Node http.
 */

import { createServer } from "node:http";
import { Readable } from "node:stream";

const port = parseInt(
  process.env.PORT || process.env.NITRO_PORT || "3000",
  10,
);
const host = process.env.NITRO_HOST || "0.0.0.0";

// --- load the built handler ------------------------------------------------
const mod = await import("./.output/server/index.mjs");
const handler = mod.default;

if (!handler || typeof handler.fetch !== "function") {
  console.error(
    "[uff-server] ERROR: .output/server/index.mjs does not export a fetch handler.\n" +
      "Run `npm run build` first.",
  );
  process.exit(1);
}

// Minimal Cloudflare ExecutionContext stub
const executionCtx = {
  waitUntil: (p) => p?.catch?.(() => {}),
  passThroughOnException: () => {},
};

// --- HTTP server ------------------------------------------------------------
const server = createServer(async (req, res) => {
  try {
    // Determine the full URL (Render terminates TLS upstream)
    const proto =
      req.headers["x-forwarded-proto"]?.split(",")[0]?.trim() ?? "http";
    const host = req.headers.host ?? "localhost";
    const url = `${proto}://${host}${req.url}`;

    // Buffer the request body (needed for POST/PUT/PATCH)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? Buffer.concat(chunks) : null;

    // Build a Web API Request
    const webRequest = new Request(url, {
      method: req.method,
      headers: new Headers(
        /** @type {Record<string,string>} */ (
          Object.fromEntries(
            Object.entries(req.headers).filter(
              ([, v]) => typeof v === "string",
            ),
          )
        ),
      ),
      // body must be omitted for GET/HEAD
      ...(body && !["GET", "HEAD"].includes(req.method ?? "GET")
        ? { body, duplex: "half" }
        : {}),
    });

    // Call the Cloudflare-style handler
    const webResponse = await handler.fetch(
      webRequest,
      {},
      executionCtx,
    );

    // Write status + headers
    res.statusCode = webResponse.status;
    for (const [key, value] of webResponse.headers.entries()) {
      // skip hop-by-hop headers that Node manages itself
      if (key.toLowerCase() === "transfer-encoding") continue;
      res.setHeader(key, value);
    }

    // Stream body back to client
    if (webResponse.body) {
      Readable.fromWeb(/** @type {import("stream/web").ReadableStream} */ (webResponse.body)).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("[uff-server] Unhandled error:", err);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.on("error", (err) => {
  console.error("[uff-server] Server error:", err);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`[uff-server] Listening on http://${host}:${port}`);
});
