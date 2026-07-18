import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, CheckCircle2, Heart } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { PROGRAMS, getProgram, type Program } from "@/data/programs";

export const Route = createFileRoute("/programs/$slug")({
  loader: ({ params }): { program: Program } => {
    const program = getProgram(params.slug);
    if (!program) throw notFound();
    return { program };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Program not found — HopeRise" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.program;
    return {
      meta: [
        { title: `${p.title} Program — HopeRise` },
        { name: "description", content: p.summary },
        { property: "og:title", content: `${p.title} — HopeRise` },
        { property: "og:description", content: p.tagline },
      ],
    };
  },
  errorComponent: ({ reset }) => (
    <SiteLayout>
      <PageHero title="Something went wrong" breadcrumb="Programs" />
      <section className="py-20 text-center">
        <button onClick={reset} className="rounded bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-white">Try Again</button>
      </section>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <PageHero title="Program not found" breadcrumb="Programs" />
      <section className="py-20 text-center">
        <p className="text-sm text-muted-foreground">The program you're looking for doesn't exist.</p>
        <Link to="/programs" className="mt-6 inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Programs
        </Link>
      </section>
    </SiteLayout>
  ),
  component: ProgramDetail,
});

function ProgramDetail() {
  const { program } = Route.useLoaderData();
  const Icon = program.icon;
  const others = PROGRAMS.filter((p) => p.slug !== program.slug);
  return (
    <SiteLayout>
      <PageHero title={program.title} breadcrumb={program.title} />
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1.1fr_1fr]">
          <img src={program.img} alt={program.title} className="w-full rounded-lg object-cover shadow-md" loading="lazy" />
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: program.color }}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <SectionEyebrow label={`Program: ${program.title}`} />
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">{program.tagline}</h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{program.summary}</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {program.stats.map((s: Program["stats"][number]) => (
                <div key={s.l} className="rounded-lg border border-border p-4">
                  <div className="text-2xl font-bold" style={{ color: program.color }}>{s.n}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/donate" className="inline-flex items-center gap-2 rounded bg-[var(--brand-orange)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition">
                Support This Program <Heart className="h-4 w-4 fill-white" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded border border-border px-6 py-3 text-sm font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-green)] transition">
                Get Involved <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[var(--brand-bg-soft)] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionEyebrow label="What We Do" />
          <h2 className="mt-3 font-display text-3xl font-extrabold text-[var(--brand-navy)]">Program Highlights</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {program.highlights.map((h: Program["highlights"][number]) => (
              <div key={h.title} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <CheckCircle2 className="h-6 w-6" style={{ color: program.color }} />
                <h3 className="mt-3 font-semibold text-[var(--brand-navy)]">{h.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <SectionEyebrow label="Explore More" />
              <h2 className="mt-3 font-display text-3xl font-extrabold text-[var(--brand-navy)]">Other Programs</h2>
            </div>
            <Link to="/programs" className="text-xs font-semibold text-[var(--brand-blue)]">View All →</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((p) => (
              <Link key={p.slug} to="/programs/$slug" params={{ slug: p.slug }} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-lg">
                <img src={p.img} alt={p.title} className="h-40 w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <h3 className="font-semibold text-[var(--brand-navy)]">{p.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}