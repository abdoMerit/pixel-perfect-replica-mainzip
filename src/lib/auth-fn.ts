import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { query, ensureSchema } from "./db";

// ── Password hashing (scrypt) ─────────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  try {
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// ── Session tokens (HMAC-SHA256) ──────────────────────────────────────────────
// Format: base64url(payload).hex(signature)
// Payload: JSON { email, name, exp }

function generateToken(email: string, name: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, name, exp: Date.now() + 30 * 24 * 3600 * 1000 }),
  ).toString("base64url");
  const secret = process.env.SESSION_SECRET ?? "uff-fallback-secret";
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Verify a token issued by generateToken. Throws if invalid or expired. */
export function verifyStaffToken(token: string): { email: string; name: string } {
  const dot = token.lastIndexOf(".");
  if (dot === -1) throw new Error("Invalid session");
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const secret = process.env.SESSION_SECRET ?? "uff-fallback-secret";
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  // constant-time compare
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))
  ) {
    throw new Error("Invalid session");
  }
  const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
    email: string;
    name: string;
    exp: number;
  };
  if (data.exp < Date.now()) throw new Error("Session expired — please sign in again");
  return { email: data.email, name: data.name };
}

// ── Register ──────────────────────────────────────────────────────────────────

export const staffRegister = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await ensureSchema();
    const existing = await query("SELECT id FROM staff_users WHERE email = $1", [
      data.email.toLowerCase(),
    ]);
    if (existing.rows.length > 0)
      throw new Error("An account with this email already exists");
    const hash = hashPassword(data.password);
    const result = await query(
      `INSERT INTO staff_users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, name, email`,
      [data.name.trim(), data.email.toLowerCase(), hash],
    );
    const user = result.rows[0] as { id: number; name: string; email: string };
    const token = generateToken(user.email, user.name);
    return { token, email: user.email, name: user.name };
  });

// ── Login ─────────────────────────────────────────────────────────────────────

export const staffLogin = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await ensureSchema();
    const result = await query(
      "SELECT id, name, email, password_hash FROM staff_users WHERE email = $1",
      [data.email.toLowerCase()],
    );
    if (result.rows.length === 0) throw new Error("Invalid email or password");
    const user = result.rows[0] as {
      id: number;
      name: string;
      email: string;
      password_hash: string;
    };
    if (!verifyPassword(data.password, user.password_hash))
      throw new Error("Invalid email or password");
    const token = generateToken(user.email, user.name);
    return { token, email: user.email, name: user.name };
  });
