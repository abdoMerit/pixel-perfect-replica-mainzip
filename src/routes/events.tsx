import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Images, X, Play } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { getPublicEvents, getEventMedia, type CmsEvent, type EventMedia } from "@/lib/content-fn";

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
  const raw = typeof dateVal === "string" ? dateVal.slice(0, 10) : dateVal.toISOString().slice(0, 10);
  const [y, m, dd] = raw.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return {
    day: String(dd).padStart(2, "0"),
    mon: (months[m - 1] ?? "").toUpperCase(),
    full: `${months[m - 1] ?? ""} ${dd}, ${y}`,
  };
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ items, startAt, onClose }: { items: EventMedia[]; startAt: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startAt);
  const item = items[idx];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx((i) => Math.min(items.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items.length, onClose]);

  if (!item) return null;

  function isYoutube(url: string) { return url.includes("youtube.com") || url.includes("youtu.be"); }
  function toEmbedUrl(url: string) {
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
    if (url.includes("vimeo.com/")) return url.replace("vimeo.com/", "player.vimeo.com/video/");
    return url;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-full max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        {item.type === "image" ? (
          <img src={item.url} alt={item.caption} className="mx-auto max-h-[80vh] rounded-lg object-contain shadow-2xl" />
        ) : isYoutube(item.url) || item.url.includes("vimeo") ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg shadow-2xl">
            <iframe src={toEmbedUrl(item.url)} className="h-full w-full" allowFullScreen />
          </div>
        ) : (
          <video src={item.url} controls className="mx-auto max-h-[80vh] rounded-lg shadow-2xl" />
        )}
        {item.caption && (
          <p className="mt-3 text-center text-sm text-white/80">{item.caption}</p>
        )}
        {/* Controls */}
        <button onClick={onClose} className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white hover:bg-white/40 transition">
          <X className="h-4 w-4" />
        </button>
        {idx > 0 && (
          <button onClick={() => setIdx(idx - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/40 transition">‹</button>
        )}
        {idx < items.length - 1 && (
          <button onClick={() => setIdx(idx + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/40 transition">›</button>
        )}
        <div className="mt-2 text-center text-xs text-white/50">{idx + 1} / {items.length}</div>
      </div>
    </div>
  );
}

// ── Event card with expandable gallery ────────────────────────────────────────

function EventCard({ event }: { event: CmsEvent }) {
  const d = fmtDate(event.event_date);
  const [showGallery, setShowGallery] = useState(false);
  const [media, setMedia] = useState<EventMedia[] | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  async function toggleGallery() {
    if (showGallery) { setShowGallery(false); return; }
    setShowGallery(true);
    if (media === null) {
      setLoadingMedia(true);
      try {
        const r = await getEventMedia({ data: { event_id: event.id } });
        setMedia(r.media);
      } finally {
        setLoadingMedia(false);
      }
    }
  }

  const hasMedia = media && media.length > 0;

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex gap-5 p-6">
        <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-lg bg-[var(--brand-green)] text-white">
          <div className="text-center">
            <div className="text-lg font-bold leading-none">{d.day}</div>
            <div className="text-[10px] uppercase mt-1">{d.mon}</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--brand-navy)]">{event.title}</h3>
          {event.description && <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            {event.event_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[var(--brand-green-dark)]" /> {event.event_time}</span>}
            {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[var(--brand-green-dark)]" /> {event.location}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-[var(--brand-green-dark)]" /> {d.full}</span>
          </div>
        </div>
        <button
          onClick={toggleGallery}
          className={`flex-shrink-0 self-start inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-semibold transition ${
            showGallery
              ? "border-[var(--brand-green)] bg-[var(--brand-green)]/10 text-[var(--brand-green-dark)]"
              : "border-border text-muted-foreground hover:border-[var(--brand-green)] hover:text-[var(--brand-green-dark)]"
          }`}
        >
          <Images className="h-3.5 w-3.5" /> Photos
        </button>
      </div>

      {/* Gallery panel */}
      {showGallery && (
        <div className="border-t border-border bg-slate-50 px-6 py-4">
          {loadingMedia ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 w-32 animate-pulse rounded-lg bg-slate-200" />)}
            </div>
          ) : !hasMedia ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No photos or videos for this event yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {media!.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setLightbox(i)}
                  className="group relative h-28 w-36 overflow-hidden rounded-lg border border-border bg-white shadow-sm hover:shadow-md transition"
                >
                  {m.type === "image" ? (
                    <img src={m.url} alt={m.caption} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-800 text-white">
                      <Play className="h-6 w-6" />
                      <span className="mt-1 text-[10px]">Video</span>
                    </div>
                  )}
                  {m.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-white line-clamp-1">
                      {m.caption}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && media && (
        <Lightbox items={media} startAt={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 animate-pulse rounded-lg bg-card border border-border" />)}
            </div>
          ) : events.length === 0 ? (
            <p className="mt-10 text-muted-foreground">No upcoming events. Check back soon.</p>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {events.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
