import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUncachableStripeClient } from "./stripeClient";

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
              name: "Donation to HopeRise",
              description: `One-time donation from ${data.name}`,
            },
          },
        },
      ],
      success_url: `${data.originUrl}/donate?success=1`,
      cancel_url: `${data.originUrl}/donate?cancelled=1`,
      metadata: { donor_name: data.name, donor_email: data.email },
    });

    return { url: session.url };
  });
