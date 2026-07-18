import Stripe from "stripe";
import { getStripeCredentials } from "./stripeClient";
import { query, ensureSchema } from "./db";

/**
 * Handles a raw Stripe webhook request.
 * Must receive the raw body bytes — do NOT parse as JSON first.
 */
export async function handleStripeWebhook(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return new Response("Failed to read request body", { status: 400 });
  }

  let credentials: { secretKey: string; webhookSecret?: string };
  try {
    credentials = await getStripeCredentials();
  } catch (err) {
    console.error("[webhook] Failed to fetch Stripe credentials:", err);
    return new Response("Internal configuration error", { status: 500 });
  }

  if (!credentials.webhookSecret) {
    console.error("[webhook] No webhook secret configured in Stripe integration settings");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const stripe = new Stripe(credentials.secretKey);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      credentials.webhookSecret,
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log(`[webhook] Received event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const sessionId = session.id;
  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "usd";
  const donorName = (session.metadata?.donor_name ?? session.customer_details?.name) || null;
  const donorEmail =
    (session.metadata?.donor_email ?? session.customer_details?.email) || null;

  try {
    await ensureSchema();
    await query(
      `INSERT INTO donations (stripe_session_id, amount_cents, currency, donor_name, donor_email, status)
       VALUES ($1, $2, $3, $4, $5, 'completed')
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [sessionId, amountTotal, currency, donorName, donorEmail],
    );
    console.log(
      `[webhook] Donation recorded: session=${sessionId} amount=${amountTotal} donor=${donorEmail}`,
    );
  } catch (err) {
    console.error("[webhook] Failed to record donation:", err);
    // Don't throw — Stripe will retry if we return non-2xx, but the event was valid.
    // Log and move on so we acknowledge receipt.
  }
}
