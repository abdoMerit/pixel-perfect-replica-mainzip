import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Target, Eye, Shield, Compass, BookOpen, Stethoscope, Leaf, Sprout } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { getPublicSettings, type SiteSettings } from "@/lib/content-fn";
import heroImg from "@/assets/hero.jpg";
import progEdu from "@/assets/prog-education.jpg";
import progHealth from "@/assets/prog-health.jpg";
import progEnv from "@/assets/prog-environment.jpg";
import progLive from "@/assets/prog-livelihood.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Unique Future Foundation (UFF)" },
      { name: "description", content: "Learn about Unique Future Foundation (UFF), our mission, vision, and the values that drive our work with communities." },
      { property: "og:title", content: "About Unique Future Foundation (UFF)" },
      { property: "og:description", content: "A non-profit working with communities worldwide to build a better future." },
    ],
  }),
  component: AboutPage,
});

const CORE_PROGRAMS = [
  {
    slug: "education",
    img: progEdu,
    icon: BookOpen,
    title: "Education",
    text: "We promote quality education and lifelong learning opportunities for all children.",
  },
  {
    slug: "health",
    img: progHealth,
    icon: Stethoscope,
    title: "Health",
    text: "We improve access to quality healthcare and promote healthy communities.",
  },
  {
    slug: "environment",
    img: progEnv,
    icon: Leaf,
    title: "Environment",
    text: "We protect the environment and promote sustainable practices for future generations.",
  },
  {
    slug: "livelihood",
    img: progLive,
    icon: Sprout,
    title: "Livelihood",
    text: "We empower communities with skills and resources for sustainable livelihoods.",
  },
];

function AboutPage() {
  const [s, setS] = useState<SiteSettings>({});

  useEffect(() => {
    getPublicSettings().then((r) => setS(r.settings));
  }, []);

  const cards = [
    { icon: Target,  color: "var(--brand-blue)",       title: "Our Mission", text: s.mission_text ?? "To empower communities and create sustainable solutions for a better tomorrow." },
    { icon: Eye,     color: "var(--brand-green-dark)", title: "Our Vision",  text: s.vision_text  ?? "A world where every individual has the opportunity to live a dignified and fulfilling life." },
    { icon: Shield,  color: "var(--brand-orange)",     title: "Our Values",  text: s.values_text  ?? "Integrity, Transparency, Compassion, Collaboration, and Accountability." },
    { icon: Compass, color: "var(--brand-purple)",     title: "Our Goals",   text: s.goals_text   ?? "To reduce poverty, promote education, improve health, and protect our planet." },
  ];

  return (
    <SiteLayout>
      <PageHero title="About Us" breadcrumb="About" />

      {/* ── Who We Are ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 lg:grid-cols-2">
          <img src={heroImg} alt="Community" className="w-full rounded-lg object-cover shadow-md" loading="lazy" />
          <div>
            <SectionEyebrow label="Who We Are" />
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">
              A Non-Profit Working <span className="text-[var(--brand-green-dark)]">Worldwide</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {s.about_description ?? "Unique Future Foundation (UFF) is a non-profit, non-governmental organization working in partnership with communities and stakeholders to improve lives through sustainable programs in education, health, environment, and economic empowerment."}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {s.about_founded ?? "Founded in 2009, our teams are on the ground in more than 25 countries — designing programs with the people they serve, not for them."}
            </p>
            <Link to="/programs" className="mt-8 inline-flex items-center gap-2 rounded bg-[var(--brand-blue)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition">
              Explore Our Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ──────────────────────────────────────── */}
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

      {/* ── Core Programs ──────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionEyebrow label="Our Programs" />
          <h2 className="mt-3 font-display text-4xl font-extrabold text-[var(--brand-navy)]">Our Core Programs</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Four focus areas, one mission — to build a better future together with the communities we serve.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_PROGRAMS.map((p) => (
              <div key={p.slug} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-lg">
                <div className="relative">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                  <div className="absolute -bottom-6 left-5 grid h-12 w-12 place-items-center rounded-full bg-[var(--brand-green)] shadow-md">
                    <p.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="p-6 pt-9">
                  <h3 className="font-semibold text-[var(--brand-navy)]">{p.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.text}</p>
                  <Link
                    to="/programs/$slug"
                    params={{ slug: p.slug }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-blue)] hover:gap-2 transition-all"
                  >
                    Read More <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition"
            >
              View All Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
