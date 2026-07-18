import "./lib/error-capture";

import { Client as ObjectStorage } from "@replit/object-storage";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleStripeWebhook } from "./lib/stripe-webhook";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
  "video/mp4":  "mp4",
  "video/webm": "webm",
  "video/ogg":  "ogv",
};

const storage = new ObjectStorage();

async function handleFileUpload(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    if (!(file.type in ALLOWED_TYPES)) {
      return Response.json({ error: `File type "${file.type}" is not allowed` }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return Response.json({ error: "File too large (max 50 MB)" }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type] ?? file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const objectName = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await storage.uploadFromBytes(objectName, buffer);
    if (!result.ok) throw new Error(String(result.error));

    return Response.json({ url: `/api/media/${objectName.replace("media/", "")}` });
  } catch (err) {
    console.error("[upload]", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}

async function handleMediaServe(request: Request, objectKey: string): Promise<Response> {
  try {
    const result = await storage.downloadAsBytes(`media/${objectKey}`);
    if (!result.ok) return new Response("Not found", { status: 404 });

    const [buf] = result.value;
    const ext = objectKey.split(".").pop()?.toLowerCase() ?? "";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      webp: "image/webp", gif: "image/gif",
      mp4: "video/mp4", webm: "video/webm", ogv: "video/ogg",
    };
    const contentType = mimeMap[ext] ?? "application/octet-stream";

    return new Response(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[media-serve]", err);
    return new Response("Error", { status: 500 });
  }
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // Handle Stripe webhook before TanStack Start so we get the raw body.
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/stripe/webhook") {
      return handleStripeWebhook(request);
    }
    if (request.method === "POST" && url.pathname === "/api/upload") {
      return handleFileUpload(request);
    }
    if (request.method === "GET" && url.pathname.startsWith("/api/media/")) {
      const objectKey = url.pathname.slice("/api/media/".length);
      if (objectKey) return handleMediaServe(request, objectKey);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
