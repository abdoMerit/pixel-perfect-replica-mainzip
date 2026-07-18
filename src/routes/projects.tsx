import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Image } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { getPublicProjects, type CmsProject } from "@/lib/content-fn";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Our Projects — Unique Future Foundation (UFF)" },
      { name: "description", content: "See the projects UFF is delivering across communities." },
      { property: "og:title", content: "Our Projects — Unique Future Foundation (UFF)" },
      { property: "og:description", content: "Schools, clinics, water, and livelihoods — projects with lasting impact." },
    ],
  }),
  component: ProjectsPage,
});

const CAT_COLORS: Record<string, string> = {
  Education:   "var(--brand-green-dark)",
  Health:      "var(--brand-orange)",
  Environment: "var(--brand-green-dark)",
  Livelihood:  "var(--brand-purple)",
  Other:       "var(--brand-navy)",
};

function ProjectsPage() {
  const [projects, setProjects] = useState<CmsProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicProjects().then((r) => setProjects(r.projects)).finally(() => setLoading(false));
  }, []);

  return (
    <SiteLayout>
      <PageHero title="Our Projects" breadcrumb="Projects" />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionEyebrow label="Recent Projects" />
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Projects Making a Difference</h2>
          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map((i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-card border border-border" />)}
            </div>
          ) : projects.length === 0 ? (
            <p className="mt-10 text-muted-foreground">No projects yet.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <div className="relative">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="h-48 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-slate-100">
                        <Image className="h-10 w-10 text-muted-foreground/25" />
                      </div>
                    )}
                    {p.category && (
                      <span
                        className="absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-semibold uppercase text-white"
                        style={{ backgroundColor: CAT_COLORS[p.category] ?? CAT_COLORS["Other"] }}
                      >
                        {p.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-[var(--brand-navy)]">{p.title}</h3>
                    {p.location && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {p.location}
                      </div>
                    )}
                    <Link to="/programs" className="mt-3 inline-block text-xs font-semibold text-[var(--brand-blue)]">Learn More →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
