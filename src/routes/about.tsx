import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Target, Eye, Shield, Compass } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — HopeRise" },
      { name: "description", content: "Learn about HopeRise, our mission, vision, and the values that drive our work with communities worldwide." },
      { property: "og:title", content: "About HopeRise" },
      { property: "og:description", content: "A non-profit working with communities worldwide to build a better future." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const cards = [
    { icon: Target, color: "var(--brand-blue)", title: "Our Mission", text: "To empower communities and create sustainable solutions for a better tomorrow." },
    { icon: Eye, color: "var(--brand-green-dark)", title: "Our Vision", text: "A world where every individual has the opportunity to live a dignified and fulfilling life." },
    { icon: Shield, color: "var(--brand-orange)", title: "Our Values", text: "Integrity, Transparency, Compassion, Collaboration, and Accountability." },
    { icon: Compass, color: "var(--brand-purple)", title: "Our Goals", text: "To reduce poverty, promote education, improve health, and protect our planet." },
  ];
  return (
    <SiteLayout>
      <PageHero title="About Us" breadcrumb="About" />
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 lg:grid-cols-2">
          <img src={heroImg} alt="Community" className="w-full rounded-lg object-cover shadow-md" loading="lazy" />
          <div>
            <SectionEyebrow label="Who We Are" />
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">
              A Non-Profit Working <span className="text-[var(--brand-green-dark)]">Worldwide</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              HopeRise Organization is a non-profit, non-governmental organization working in partnership with communities and stakeholders to improve lives through sustainable programs in education, health, environment, and economic empowerment.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Founded in 2009, our teams are on the ground in more than 25 countries — designing programs with the people they serve, not for them.
            </p>
            <Link to="/programs" className="mt-8 inline-flex items-center gap-2 rounded bg-[var(--brand-blue)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition">
              Explore Our Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-[var(--brand-bg-soft)] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="flex justify-center"><SectionEyebrow label="What Drives Us" /></div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Mission, Vision &amp; Values</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.title} className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
                <div className="grid h-11 w-11 place-items-center rounded-full" style={{ backgroundColor: c.color }}>
                  <c.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--brand-navy)]">{c.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}