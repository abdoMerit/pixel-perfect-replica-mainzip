import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer — Unique Future Foundation (UFF)" },
      { name: "description", content: "Join Unique Future Foundation (UFF) as a volunteer." },
      { property: "og:title", content: "Volunteer with Unique Future Foundation (UFF)" },
      { property: "og:description", content: "Give your time and skills to communities worldwide." },
    ],
  }),
  component: VolunteerPage,
});

function VolunteerPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <PageHero title="Volunteer" breadcrumb="Volunteer" />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <div className="flex justify-center"><SectionEyebrow label="Join Our Team" /></div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Become A Volunteer</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">Share your time and skills with communities we serve.</p>
          </div>
          <form className="mt-10 rounded-lg border border-border bg-card p-8 shadow-sm space-y-4" onSubmit={(e) => { e.preventDefault(); (e.currentTarget as HTMLFormElement).reset(); setSent(true); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Full Name" className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
              <input required type="email" placeholder="Email Address" className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Phone Number" className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
              <select className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]">
                <option>Area of Interest</option>
                <option>Education</option>
                <option>Health</option>
                <option>Environment</option>
                <option>Livelihood</option>
              </select>
            </div>
            <textarea placeholder="Tell us about your skills and availability..." rows={5} className="w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-green)] py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition">
              Submit Application <HeartHandshake className="h-4 w-4" />
            </button>
            {sent && <p className="text-center text-sm text-[var(--brand-green-dark)]">Thanks! We'll be in touch soon.</p>}
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}