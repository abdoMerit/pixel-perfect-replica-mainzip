import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { query, ensureSchema } from "./db";

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

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
