import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";
import { getPublicProjects, getPublicEvents, type CmsProject, type CmsEvent } from "@/lib/content-fn";
import { getEventMedia, type EventMedia } from "@/lib/content-fn";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Unique Future Foundation (UFF)" },
      { name: "description", content: "Browse photos and media from Unique Future Foundation's programs, projects, and events." },
      { property: "og:title", content: "Gallery — Unique Future Foundation (UFF)" },
      { property: "og:description", content: "See our work in action — photos from the field, events, and community programs." },
    ],
  }),
  component: GalleryPage,
});

type GalleryImage = {
  url: string;
  caption: string;
  category: string;
};

type Lightbox = { images: GalleryImage[]; index: number } | null;

function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<Lightbox>(null);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, evtRes] = await Promise.all([
          getPublicProjects(),
          getPublicEvents(),
        ]);

        const collected: GalleryImage[] = [];

        // Add project images
        for (const p of projRes.projects) {
          if (p.image_url) {
            collected.push({ url: p.image_url, caption: p.title, category: p.category ?? "Projects" });
          }
        }

        // Add event media (images only)
        const events: CmsEvent[] = evtRes.events;
        await Promise.all(
          events.map(async (evt) => {
            try {
              const mediaRes = await getEventMedia({ data: { eventId: evt.id } });
              for (const m of mediaRes.media) {
                if (m.type === "image" && m.url) {
                  collected.push({
                    url: m.url,
                    caption: m.caption || evt.title,
                    category: "Events",
                  });
                }
              }
            } catch {
              // skip if no media
            }
          })
        );

        setImages(collected);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category)))];
  const filtered = activeCategory === "All" ? images : images.filter((i) => i.category === activeCategory);

  const openLightbox = (index: number) => setLightbox({ images: filtered, index });
  const closeLightbox = () => setLightbox(null);
  const prev = useCallback(() => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length });
  }, [lightbox]);
  const next = useCallback(() => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") closeLightbox();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  return (
    <SiteLayout>
      <PageHero title="Gallery" breadcrumb="Gallery" />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <SectionEyebrow label="Photo Gallery" />
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">
              Our Work in Action
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Browse photos from our programs, projects, and events across the communities we serve.
            </p>
          </div>

          {/* Category filter */}
          {!loading && images.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[var(--brand-green)] text-white shadow-sm"
                      : "border border-border bg-white text-[var(--brand-navy)] hover:border-[var(--brand-green)] hover:text-[var(--brand-green-dark)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-20 flex flex-col items-center gap-4 text-center text-muted-foreground">
              <Image className="h-12 w-12 opacity-20" />
              <p className="text-sm">No photos yet. Upload event or project images in the admin panel.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 focus:outline-none"
                >
                  <img
                    src={img.url}
                    alt={img.caption}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                    <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full p-3">
                      <p className="text-xs font-medium text-white line-clamp-2">{img.caption}</p>
                      <span className="mt-0.5 inline-block rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white/80">
                        {img.category}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex max-h-[85vh] max-w-4xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.images[lightbox.index].url}
              alt={lightbox.images[lightbox.index].caption}
              className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <p className="text-center text-sm text-white/80">{lightbox.images[lightbox.index].caption}</p>
            <p className="text-[11px] text-white/40">{lightbox.index + 1} / {lightbox.images.length}</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </SiteLayout>
  );
}
