import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { getPublicEvents, type CmsEvent } from "@/lib/content-fn";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Unique Future Foundation (UFF)" },
      { name: "description", content: "Join UFF events, fundraisers, and community gatherings." },
      { property: "og:title", content: "Events — Unique Future Foundation (UFF)" },
      { property: "og:description", content: "Upcoming events, fundraisers, and community gatherings." },
    ],
  }),
  component: EventsPage,
});

function fmtDate(dateVal: string | Date) {
  // PG DATE columns may arrive as a JS Date object or ISO string
  const raw = typeof dateVal === "string" ? dateVal.slice(0, 10) : dateVal.toISOString().slice(0, 10);
  const [y, m, dd] = raw.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return {
    day: String(dd).padStart(2, "0"),
    mon: (months[m - 1] ?? "").toUpperCase(),
    full: `${months[m - 1] ?? ""} ${dd}, ${y}`,
  };
}

function EventsPage() {
  const [events, setEvents] = useState<CmsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicEvents().then((r) => setEvents(r.events)).finally(() => setLoading(false));
  }, []);

  return (
    <SiteLayout>
      <PageHero title="Events" breadcrumb="Events" />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionEyebrow label="Upcoming Events" />
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Join Us In Person or Online</h2>
          {loading ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {[1,2,3,4].map((i) => <div key={i} className="h-36 animate-pulse rounded-lg bg-card border border-border" />)}
            </div>
          ) : events.length === 0 ? (
            <p className="mt-10 text-muted-foreground">No upcoming events. Check back soon.</p>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {events.map((e) => {
                const d = fmtDate(e.event_date);
                return (
                  <div key={e.id} className="flex gap-5 rounded-lg border border-border bg-card p-6 shadow-sm">
                    <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-lg bg-[var(--brand-green)] text-white">
                      <div className="text-center">
                        <div className="text-lg font-bold leading-none">{d.day}</div>
                        <div className="text-[10px] uppercase mt-1">{d.mon}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--brand-navy)]">{e.title}</h3>
                      {e.description && <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                        {e.event_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[var(--brand-green-dark)]" /> {e.event_time}</span>}
                        {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[var(--brand-green-dark)]" /> {e.location}</span>}
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-[var(--brand-green-dark)]" /> {d.full}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
