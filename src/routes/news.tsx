import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, ArrowRight, Image } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { getPublicNews, type NewsArticle } from "@/lib/content-fn";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Updates — Unique Future Foundation (UFF)" },
      { name: "description", content: "Read the latest news, stories, and updates from Unique Future Foundation (UFF)." },
      { property: "og:title", content: "News & Updates — Unique Future Foundation (UFF)" },
      { property: "og:description", content: "Latest stories from our programs and communities." },
    ],
  }),
  component: NewsPage,
});

function fmtDate(dateVal: string | Date) {
  const raw = typeof dateVal === "string" ? dateVal.slice(0, 10) : dateVal.toISOString().slice(0, 10);
  const [y, m, dd] = raw.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[m - 1] ?? ""} ${dd}, ${y}`;
}

function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicNews().then((r) => setArticles(r.articles)).finally(() => setLoading(false));
  }, []);

  return (
    <SiteLayout>
      <PageHero title="News & Updates" breadcrumb="News" />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionEyebrow label="Latest News" />
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Stories From The Field</h2>
          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map((i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-card border border-border" />)}
            </div>
          ) : articles.length === 0 ? (
            <p className="mt-10 text-muted-foreground">No articles yet. Check back soon.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((n) => (
                <article key={n.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-lg">
                  {n.image_url ? (
                    <img src={n.image_url} alt={n.title} className="h-48 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-slate-100">
                      <Image className="h-10 w-10 text-muted-foreground/25" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {fmtDate(n.published_date)}
                    </div>
                    <h3 className="mt-2 font-semibold text-[var(--brand-navy)] leading-snug">{n.title}</h3>
                    {n.excerpt && <p className="mt-2 text-xs text-muted-foreground">{n.excerpt}</p>}
                    <button type="button" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-blue)]">
                      Read More <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
