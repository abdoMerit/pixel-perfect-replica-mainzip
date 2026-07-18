import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUncachableStripeClient } from "./stripeClient";
import { query, ensureSchema } from "./db";

const DonateSchema = z.object({
  amountCents: z.number().int().min(100), // minimum $1
  name: z.string().min(1),
  email: z.string().email(),
  originUrl: z.string().url(),
});

export const createDonationCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => DonateSchema.parse(data))
  .handler(async ({ data }) => {
    const stripe = await getUncachableStripeClient();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: data.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: data.amountCents,
            product_data: {
              name: "Donation to Unique Future Foundation (UFF)",
              description: `One-time donation from ${data.name}`,
            },
          },
        },
      ],
      // {CHECKOUT_SESSION_ID} is replaced by Stripe with the actual session ID
      success_url: `${data.originUrl}/donate?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.originUrl}/donate?cancelled=1`,
      metadata: { donor_name: data.name, donor_email: data.email },
    });

    return { url: session.url };
  });

const VerifySessionSchema = z.object({
  sessionId: z.string().min(1),
});

export type DonationVerification =
  | { verified: true; amountCents: number; currency: string; donorName: string | null }
  | { verified: false; reason: string };

/**
 * Verifies a Stripe Checkout session is genuinely paid.
 * First checks our local donations table (populated by webhook), then falls
 * back to querying Stripe directly so the thank-you page works even if the
 * webhook hasn't arrived yet.
 */
export const verifyDonationSession = createServerFn({ method: "POST" })
  .validator((data: unknown) => VerifySessionSchema.parse(data))
  .handler(async ({ data }): Promise<DonationVerification> => {
    const { sessionId } = data;

    // 1. Check local DB first (webhook already processed it)
    try {
      await ensureSchema();
      const dbResult = await query(
        `SELECT amount_cents, currency, donor_name FROM donations WHERE stripe_session_id = $1 LIMIT 1`,
        [sessionId],
      );
      if (dbResult.rows.length > 0) {
        const row = dbResult.rows[0] as {
          amount_cents: number;
          currency: string;
          donor_name: string | null;
        };
        return {
          verified: true,
          amountCents: row.amount_cents,
          currency: row.currency,
          donorName: row.donor_name,
        };
      }
    } catch (err) {
      console.error("[verify] DB lookup failed:", err);
      // Fall through to Stripe API check
    }

    // 2. Fall back to Stripe API — webhook may not have arrived yet
    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        return {
          verified: true,
          amountCents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          donorName:
            (session.metadata?.donor_name ?? session.customer_details?.name) || null,
        };
      }

      return { verified: false, reason: `Payment status: ${session.payment_status}` };
    } catch (err) {
      console.error("[verify] Stripe session lookup failed:", err);
      return { verified: false, reason: "Could not verify payment at this time." };
    }
  });
