import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";

export const Route = createFileRoute("/donate")({
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
  const amounts = [25, 50, 100, 250, 500, 1000];
  const [amount, setAmount] = useState<number | "">(50);
  const [sent, setSent] = useState(false);
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
          <form className="mt-10 rounded-lg border border-border bg-card p-8 shadow-sm" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="grid grid-cols-3 gap-3">
              {amounts.map((a) => (
                <button type="button" key={a} onClick={() => setAmount(a)}
                  className={`rounded border-2 py-3 text-sm font-semibold transition ${amount === a ? "border-[var(--brand-green)] bg-[var(--brand-green)]/10 text-[var(--brand-green-dark)]" : "border-border text-[var(--brand-navy)] hover:border-[var(--brand-green)]"}`}>
                  ${a}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold text-[var(--brand-navy)]">Custom amount (USD)</label>
              <input type="number" min={1} value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Your Name" className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
              <input required type="email" placeholder="Email Address" className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
            </div>
            <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-orange)] py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition">
              Donate ${amount || 0} <Heart className="h-4 w-4 fill-white" />
            </button>
            {sent && <p className="mt-4 text-center text-sm text-[var(--brand-green-dark)]">Thank you! Your donation has been received.</p>}
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}