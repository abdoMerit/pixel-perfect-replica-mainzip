import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { getPublicReports, type CmsReport } from "@/lib/content-fn";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Publications — Unique Future Foundation (UFF)" },
      { name: "description", content: "Download annual reports, program reports, and publications from Unique Future Foundation (UFF)." },
      { property: "og:title", content: "Reports & Publications — Unique Future Foundation (UFF)" },
      { property: "og:description", content: "Access our annual reports, program evaluations, and field publications." },
    ],
  }),
  component: ReportsPage,
});

const TYPE_COLORS: Record<string, string> = {
  "Annual Report":    "bg-[var(--brand-green-dark)] text-white",
  "Program Report":   "bg-[var(--brand-blue)] text-white",
  "Profile":          "bg-[var(--brand-orange)] text-white",
  "Field Report":     "bg-purple-600 text-white",
  "Financial Report": "bg-slate-600 text-white",
  "Other":            "bg-slate-400 text-white",
};

// Fallback placeholder reports shown when database is empty
const PLACEHOLDER_REPORTS = [
  { id: -1, title: "UFF Annual Report 2024", year: "2024", report_type: "Annual Report", description: "A comprehensive overview of our programs, impact, financials, and stories from the field in 2024.", file_url: "", sort_order: 0 },
  { id: -2, title: "UFF Annual Report 2023", year: "2023", report_type: "Annual Report", description: "Highlights of our education, health, environment, and livelihood programs in 2023.", file_url: "", sort_order: 1 },
  { id: -3, title: "Organization Profile 2023", year: "2023", report_type: "Profile", description: "An overview of Unique Future Foundation — our mission, programs, reach, and partnerships.", file_url: "", sort_order: 2 },
  { id: -4, title: "Education Program Evaluation", year: "2022", report_type: "Program Report", description: "An independent evaluation of our girls' scholarship and classroom construction programs.", file_url: "", sort_order: 3 },
  { id: -5, title: "Clean Water Initiative — Final Report", year: "2022", report_type: "Program Report", description: "Results and community outcomes from our clean water welldrilling initiative in Kismayo.", file_url: "", sort_order: 4 },
  { id: -6, title: "Community Health Program Mid-Term Report", year: "2021", report_type: "Program Report", description: "Progress review of mobile clinic and maternal health programs in Garowe.", file_url: "", sort_order: 5 },
];

function ReportsPage() {
  const [reports, setReports] = useState<CmsReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicReports()
      .then((r) => setReports(r.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayReports = reports.length > 0 ? reports : (loading ? [] : PLACEHOLDER_REPORTS as CmsReport[]);

  return (
    <SiteLayout>
      <PageHero title="Reports & Publications" breadcrumb="Reports" />

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <SectionEyebrow label="Transparency & Accountability" />
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">
              Our Publications
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              We believe in full transparency. Below you'll find our annual reports, program evaluations, and publications that document our work and impact.
            </p>
          </div>

          {loading ? (
            <div className="mt-12 space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-white" />)}
            </div>
          ) : (
            <div className="mt-12 divide-y divide-border rounded-lg border border-border bg-white shadow-sm">
              {displayReports.map((r) => (
                <div key={r.id} className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)]/10">
                      <FileText className="h-5 w-5 text-[var(--brand-green-dark)]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--brand-navy)]">{r.title}</h3>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[r.report_type] ?? "bg-slate-200 text-slate-700"}`}>
                          {r.report_type}
                        </span>
                      </div>
                      {r.description && <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}
                      {r.year && <p className="mt-1 text-[11px] text-muted-foreground/60">{r.year}</p>}
                    </div>
                  </div>
                  <div className="ml-15 sm:ml-0 shrink-0">
                    {r.file_url ? (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded border border-[var(--brand-green)] px-4 py-2 text-xs font-semibold text-[var(--brand-green-dark)] hover:bg-[var(--brand-green)] hover:text-white transition"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2 text-xs font-semibold text-muted-foreground cursor-not-allowed">
                        <ExternalLink className="h-3.5 w-3.5" /> Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 rounded-lg border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/5 p-6 text-sm text-[var(--brand-navy)]">
            <strong className="block mb-1">Need a specific report?</strong>
            Contact us at{" "}
            <a href="mailto:info@uniquefuturefoundation.org" className="font-medium text-[var(--brand-green-dark)] underline underline-offset-2">
              info@uniquefuturefoundation.org
            </a>{" "}
            and we'll be happy to help.
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
