import { createFileRoute } from "@tanstack/react-router";
import { Calendar, ArrowRight } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Updates — HopeRise" },
      { name: "description", content: "Read the latest news, stories, and updates from HopeRise." },
      { property: "og:title", content: "News & Updates — HopeRise" },
      { property: "og:description", content: "Latest stories from our programs and communities." },
    ],
  }),
  component: NewsPage,
});

const ITEMS = [
  { img: news1, title: "HopeRise Launches New Education Program for Girls", date: "May 20, 2024", excerpt: "A new scholarship initiative will support 2,000 girls to complete secondary school." },
  { img: news2, title: "Clean Water Initiative Reaches 10,000 Communities", date: "May 15, 2024", excerpt: "Together with local partners, we've drilled hundreds of new wells this year." },
  { img: news3, title: "Annual Report 2023: A Year of Significant Impact", date: "May 10, 2024", excerpt: "Our 2023 annual report highlights progress across all four program areas." },
  { img: news1, title: "Field Story: A New Chapter in Mogadishu", date: "Apr 28, 2024", excerpt: "How one community rebuilt its school with parents, teachers, and neighbors leading the way." },
  { img: news2, title: "Partnering With Local Farmers for Food Security", date: "Apr 15, 2024", excerpt: "Drought-resistant seeds and training are helping farmers weather harder seasons." },
  { img: news3, title: "Volunteers Week: Meet the People Behind Our Work", date: "Apr 02, 2024", excerpt: "Celebrating the volunteers who make everything possible." },
];

function NewsPage() {
  return (
    <SiteLayout>
      <PageHero title="News & Updates" breadcrumb="News" />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionEyebrow label="Latest News" />
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Stories From The Field</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((n, i) => (
              <article key={i} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-lg">
                <img src={n.img} alt={n.title} className="h-48 w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Calendar className="h-3 w-3" /> {n.date}</div>
                  <h3 className="mt-2 font-semibold text-[var(--brand-navy)] leading-snug">{n.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{n.excerpt}</p>
                  <button type="button" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-blue)]">Read More <ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}