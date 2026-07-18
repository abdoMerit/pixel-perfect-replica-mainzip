import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { PROGRAMS } from "@/data/programs";

export const Route = createFileRoute("/programs/")({
  head: () => ({
    meta: [
      { title: "Our Programs — HopeRise" },
      { name: "description", content: "Explore HopeRise programs in education, health, environment, and livelihood." },
      { property: "og:title", content: "Our Programs — HopeRise" },
      { property: "og:description", content: "Programs that create real change in communities worldwide." },
    ],
  }),
  component: ProgramsIndex,
});

function ProgramsIndex() {
  return (
    <SiteLayout>
      <PageHero title="Our Programs" breadcrumb="Programs" />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="flex justify-center"><SectionEyebrow label="What We Do" /></div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Programs That Create Change</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              Four focus areas, one mission: build a better future with the communities we serve.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS.map((p) => (
              <div key={p.slug} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-lg">
                <div className="relative">
                  <img src={p.img} alt={p.title} className="h-52 w-full object-cover" loading="lazy" />
                  <div className="absolute -bottom-6 left-5 grid h-12 w-12 place-items-center rounded-full shadow-md" style={{ backgroundColor: p.color }}>
                    <p.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="p-6 pt-9">
                  <h3 className="font-semibold text-[var(--brand-navy)]">{p.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.summary}</p>
                  <Link to="/programs/$slug" params={{ slug: p.slug }} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-blue)] hover:gap-2 transition-all">
                    Read More <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}