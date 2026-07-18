import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { query, ensureSchema } from "./db";

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

export type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  submitted_at: string;
};

export const submitContact = createServerFn({ method: "POST" })
  .validator((data: unknown) => ContactSchema.parse(data))
  .handler(async ({ data }) => {
    // Idempotent — creates the table on first run in any environment.
    await ensureSchema();

    try {
      await query(
        `INSERT INTO contact_submissions (name, email, subject, message)
         VALUES ($1, $2, $3, $4)`,
        [data.name, data.email, data.subject ?? null, data.message],
      );
    } catch (err) {
      console.error("[contact] DB insert failed:", err);
      throw new Error("Failed to save your message. Please try again.");
    }

    return { ok: true };
  });

const AdminAuthSchema = z.object({
  password: z.string().min(1),
});

export const getSubmissions = createServerFn({ method: "POST" })
  .validator((data: unknown) => AdminAuthSchema.parse(data))
  .handler(async ({ data }) => {
    const adminPassword = process.env.SESSION_SECRET;
    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("Unauthorized");
    }

    await ensureSchema();

    const result = await query(
      `SELECT id, name, email, subject, message, submitted_at
       FROM contact_submissions
       ORDER BY submitted_at DESC`,
    );

    return { submissions: result.rows as ContactSubmission[] };
  });

export const exportSubmissionsCsv = createServerFn({ method: "POST" })
  .validator((data: unknown) => AdminAuthSchema.parse(data))
  .handler(async ({ data }) => {
    const adminPassword = process.env.SESSION_SECRET;
    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("Unauthorized");
    }

    await ensureSchema();

    const result = await query(
      `SELECT id, name, email, subject, message, submitted_at
       FROM contact_submissions
       ORDER BY submitted_at DESC`,
    );

    const rows = result.rows as ContactSubmission[];

    const escape = (v: string | null | undefined) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };

    const header = ["ID", "Name", "Email", "Subject", "Message", "Submitted At"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [r.id, r.name, r.email, r.subject ?? "", r.message, r.submitted_at]
          .map((v) => escape(String(v ?? "")))
          .join(","),
      ),
    ];

    return { csv: lines.join("\r\n") };
  });
