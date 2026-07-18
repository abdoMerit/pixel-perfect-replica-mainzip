import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, CheckCircle2 } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { createDonationCheckout } from "@/lib/donate-fn";

export const Route = createFileRoute("/donate")({
  validateSearch: (search: Record<string, unknown>) => ({
    success: search.success === "1" || search.success === 1,
    cancelled: search.cancelled === "1" || search.cancelled === 1,
  }),
  head: () => ({
    meta: [
      { title: "Donate — Unique Future Foundation (UFF)" },
      { name: "description", content: "Support Unique Future Foundation (UFF) programs." },
      { property: "og:title", content: "Donate to Unique Future Foundation (UFF)" },
      { property: "og:description", content: "Your gift funds programs in communities worldwide." },
    ],
  }),
  component: DonatePage,
});

function DonatePage() {
  const { success, cancelled } = useSearch({ from: "/donate" });
  const amounts = [25, 50, 100, 250, 500, 1000];
  const [amount, setAmount] = useState<number | "">(50);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cents = Math.round(Number(amount) * 100);
    if (!cents || cents < 100) {
      setError("Please enter a donation amount of at least $1.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createDonationCheckout({
        data: {
          amountCents: cents,
          name,
          email,
          originUrl: window.location.origin,
        },
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setError("Something went wrong starting your donation. Please try again.");
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <SiteLayout>
        <PageHero title="Donate" breadcrumb="Donate" />
        <section className="py-20">
          <div className="mx-auto max-w-lg px-4 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-[var(--brand-green)]" />
            <h2 className="mt-6 font-display text-3xl font-extrabold text-[var(--brand-navy)]">Thank You!</h2>
            <p className="mt-3 text-muted-foreground">
              Your donation has been received. You'll get a receipt by email shortly.
              Every gift makes a real difference in the communities we serve.
            </p>
            <a
              href="/donate"
              className="mt-8 inline-block rounded bg-[var(--brand-orange)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition"
            >
              Donate Again
            </a>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHero title="Donate" breadcrumb="Donate" />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <div className="flex justify-center"><SectionEyebrow label="Make A Difference" /></div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Every Gift Changes A Life</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">100% of your donation goes directly to program work.</p>
          </div>

          {cancelled && (
            <p className="mt-6 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
              Your donation was cancelled — no charge was made. You're welcome to try again.
            </p>
          )}

          <form
            className="mt-10 rounded-lg border border-border bg-card p-8 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-3 gap-3">
              {amounts.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`rounded border-2 py-3 text-sm font-semibold transition ${
                    amount === a
                      ? "border-[var(--brand-green)] bg-[var(--brand-green)]/10 text-[var(--brand-green-dark)]"
                      : "border-border text-[var(--brand-navy)] hover:border-[var(--brand-green)]"
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold text-[var(--brand-navy)]">Custom amount (USD)</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]"
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]"
              />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]"
              />
            </div>
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-orange)] py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-60"
            >
              {submitting ? "Redirecting to checkout…" : `Donate $${amount || 0}`}{" "}
              <Heart className="h-4 w-4 fill-white" />
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure checkout powered by Stripe. You'll be redirected to complete your payment.
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
