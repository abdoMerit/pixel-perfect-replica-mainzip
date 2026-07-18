import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import projSchool from "@/assets/proj-school.jpg";
import projHealthImg from "@/assets/proj-health.jpg";
import projWater from "@/assets/proj-water.jpg";
import progEdu from "@/assets/prog-education.jpg";
import progLive from "@/assets/prog-livelihood.jpg";
import progEnv from "@/assets/prog-environment.jpg";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Our Projects — HopeRise" },
      { name: "description", content: "See the projects HopeRise is delivering across communities worldwide." },
      { property: "og:title", content: "Our Projects — HopeRise" },
      { property: "og:description", content: "Schools, clinics, water, and livelihoods — projects with lasting impact." },
    ],
  }),
  component: ProjectsPage,
});

const PROJECTS = [
  { img: projSchool, tag: "Education", tagColor: "var(--brand-green-dark)", title: "Building Schools for a Better Future", loc: "Mogadishu, Somalia" },
  { img: projHealthImg, tag: "Health", tagColor: "var(--brand-orange)", title: "Community Health Care Program", loc: "Garowe, Somalia" },
  { img: projWater, tag: "Environment", tagColor: "var(--brand-green-dark)", title: "Clean Water Initiative", loc: "Kismayo, Somalia" },
  { img: progEdu, tag: "Education", tagColor: "var(--brand-green-dark)", title: "Girls' Scholarship Program", loc: "Nairobi, Kenya" },
  { img: progLive, tag: "Livelihood", tagColor: "var(--brand-purple)", title: "Women's Cooperative Fund", loc: "Kampala, Uganda" },
  { img: progEnv, tag: "Environment", tagColor: "var(--brand-green-dark)", title: "Reforestation Campaign", loc: "Addis Ababa, Ethiopia" },
];

function ProjectsPage() {
  return (
    <SiteLayout>
      <PageHero title="Our Projects" breadcrumb="Projects" />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionEyebrow label="Recent Projects" />
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Projects Making a Difference</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p) => (
              <div key={p.title} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="relative">
                  <img src={p.img} alt={p.title} className="h-48 w-full object-cover" loading="lazy" />
                  <span className="absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-semibold uppercase text-white" style={{ backgroundColor: p.tagColor }}>{p.tag}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-[var(--brand-navy)]">{p.title}</h3>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> {p.loc}</div>
                  <Link to="/programs" className="mt-3 inline-block text-xs font-semibold text-[var(--brand-blue)]">Learn More →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}