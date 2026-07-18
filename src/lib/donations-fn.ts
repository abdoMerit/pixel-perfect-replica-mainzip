import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { query, ensureSchema } from "./db";
import { verifyStaffToken } from "./auth-fn";

export type Donation = {
  id: number;
  stripe_session_id: string;
  amount_cents: number;
  currency: string;
  donor_name: string | null;
  donor_email: string | null;
  status: string;
  created_at: string;
};

const AdminAuthSchema = z.object({ token: z.string().min(1) });

export const getDonations = createServerFn({ method: "POST" })
  .validator((data: unknown) => AdminAuthSchema.parse(data))
  .handler(async ({ data }) => {
    verifyStaffToken(data.token);
    await ensureSchema();
    const result = await query(
      `SELECT id, stripe_session_id, amount_cents, currency, donor_name, donor_email, status, created_at
       FROM donations
       ORDER BY created_at DESC`,
    );
    return { donations: result.rows as Donation[] };
  });

export const exportDonationsCsv = createServerFn({ method: "POST" })
  .validator((data: unknown) => AdminAuthSchema.parse(data))
  .handler(async ({ data }) => {
    verifyStaffToken(data.token);
    await ensureSchema();
    const result = await query(
      `SELECT id, stripe_session_id, amount_cents, currency, donor_name, donor_email, status, created_at
       FROM donations
       ORDER BY created_at DESC`,
    );
    const rows = result.rows as Donation[];
    const escape = (v: string | null | undefined) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    const header = ["ID", "Stripe Session", "Amount (USD)", "Currency", "Donor Name", "Donor Email", "Status", "Date"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.id,
          r.stripe_session_id,
          (r.amount_cents / 100).toFixed(2),
          r.currency.toUpperCase(),
          r.donor_name ?? "",
          r.donor_email ?? "",
          r.status,
          r.created_at,
        ]
          .map((v) => escape(String(v ?? "")))
          .join(","),
      ),
    ];
    return { csv: lines.join("\r\n") };
  });
