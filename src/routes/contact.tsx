import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Unique Future Foundation (UFF)" },
      { name: "description", content: "Get in touch with the Unique Future Foundation (UFF) team." },
      { property: "og:title", content: "Contact Unique Future Foundation (UFF)" },
      { property: "og:description", content: "Reach out about partnerships, volunteering, or questions." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const items = [
    { icon: MapPin, title: "Our Office", text: "KM4, Hodan District\nMogadishu, Somalia" },
    { icon: Phone, title: "Call Us", text: "+252 61 2345678" },
    { icon: Mail, title: "Email Us", text: "info@uff.org" },
    { icon: Clock, title: "Working Hours", text: "Mon - Fri: 8AM - 5PM" },
  ];
  return (
    <SiteLayout>
      <PageHero title="Contact Us" breadcrumb="Contact" />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <div key={it.title} className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--brand-green)]/15">
                  <it.icon className="h-5 w-5 text-[var(--brand-green-dark)]" />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--brand-navy)]">{it.title}</h3>
                <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">{it.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <div>
              <SectionEyebrow label="Get In Touch" />
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Send Us A Message</h2>
              <p className="mt-3 text-sm text-muted-foreground">We'll get back within two business days.</p>
              <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); (e.currentTarget as HTMLFormElement).reset(); setSent(true); }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required placeholder="Your Name" className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
                  <input required type="email" placeholder="Email Address" className="rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
                </div>
                <input placeholder="Subject" className="w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
                <textarea required placeholder="Your message..." rows={6} className="w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)]" />
                <button type="submit" className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition">
                  Send Message <Send className="h-4 w-4" />
                </button>
                {sent && <p className="text-xs text-[var(--brand-green-dark)]">Thanks! Your message has been sent.</p>}
              </form>
            </div>
            <div className="overflow-hidden rounded-lg border border-border shadow-sm">
              <iframe title="Map" src="https://www.openstreetmap.org/export/embed.html?bbox=45.28%2C2.02%2C45.38%2C2.09&layer=mapnik" className="h-full min-h-[420px] w-full" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}