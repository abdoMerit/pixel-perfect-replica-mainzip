import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { ImageUpload } from "@/components/image-upload";
import {
  adminGetHeroSlides, adminCreateSlide, adminUpdateSlide, adminDeleteSlide,
  type HeroSlide,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/hero-slides")({
  head: () => ({ meta: [{ title: "Hero Slides — UFF Admin" }] }),
  component: HeroSlidesPage,
});

type SlideForm = Omit<HeroSlide, "id"> & { id?: number };

function emptySlide(): SlideForm {
  return { image_url: "", headline: "", subtext: "", badge_text: "Together We Can", cta_label: "Our Programs", cta_to: "/programs", sort_order: 0, active: true };
}

function HeroSlidesPage() {
  const { token } = useAdmin();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<SlideForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { const r = await adminGetHeroSlides({ data: { token } }); setSlides(r.slides); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startNew() { setForm(emptySlide()); setError(null); }
  function startEdit(s: HeroSlide) { setForm({ ...s }); setError(null); }
  function cancelForm() { setForm(null); setError(null); }
  function setField<K extends keyof SlideForm>(k: K, v: SlideForm[K]) {
    setForm((f) => f ? { ...f, [k]: v } : f);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true); setError(null);
    try {
      if (form.id) {
        await adminUpdateSlide({ data: { token, id: form.id, ...form } });
      } else {
        await adminCreateSlide({ data: { token, ...form } });
      }
      setForm(null); await load();
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this slide?")) return;
    setDeletingId(id);
    try { await adminDeleteSlide({ data: { token, id } }); await load(); }
    finally { setDeletingId(null); }
  }

  const inputCls = "w-full rounded border border-border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/20";
  const labelCls = "mb-1.5 block text-xs font-semibold text-[var(--brand-navy)]";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Hero Slides</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add up to 5 hero images that cycle on the homepage. Each slide can have its own headline and call-to-action.
          </p>
        </div>
        {!form && (
          <button onClick={startNew} className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition">
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        )}
      </div>

      {/* Form */}
      {form && (
        <div className="mb-6 rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-[var(--brand-navy)]">{form.id ? "Edit Slide" : "New Slide"}</h2>
          <form onSubmit={handleSave} className="grid gap-5 sm:grid-cols-2">
            {/* Image upload */}
            <div className="sm:col-span-2">
              <ImageUpload
                label="Slide Image *"
                value={form.image_url}
                onChange={(url) => setField("image_url", url)}
                accept="image/*"
                hint="Recommended: 1600 × 900 px or wider. Supports JPEG, PNG, WebP."
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Headline</label>
              <input className={inputCls} value={form.headline} onChange={(e) => setField("headline", e.target.value)} placeholder="Building a Better Future for All" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Subtext</label>
              <textarea className={`${inputCls} min-h-[70px] resize-y`} value={form.subtext} onChange={(e) => setField("subtext", e.target.value)} placeholder="We work in partnership with local communities…" />
            </div>
            <div>
              <label className={labelCls}>Badge Text</label>
              <input className={inputCls} value={form.badge_text} onChange={(e) => setField("badge_text", e.target.value)} placeholder="Together We Can" />
            </div>
            <div>
              <label className={labelCls}>CTA Button Label</label>
              <input className={inputCls} value={form.cta_label} onChange={(e) => setField("cta_label", e.target.value)} placeholder="Our Programs" />
            </div>
            <div>
              <label className={labelCls}>CTA Button Link</label>
              <input className={inputCls} value={form.cta_to} onChange={(e) => setField("cta_to", e.target.value)} placeholder="/programs" />
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input className={inputCls} type="number" value={form.sort_order} onChange={(e) => setField("sort_order", parseInt(e.target.value) || 0)} />
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} className="h-4 w-4 rounded border-border accent-[var(--brand-green)]" />
                <span className="text-sm font-medium text-[var(--brand-navy)]">Visible on website</span>
              </label>
            </div>

            {error && <p className="sm:col-span-2 text-xs text-red-600">{error}</p>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save Slide"}
              </button>
              <button type="button" onClick={cancelForm} className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-slate-50 transition">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slide list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-lg bg-white border border-border" />)}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white py-20 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">No slides yet. Click "Add Slide" to create your first hero image.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((s) => (
            <div key={s.id} className="group relative overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              {s.image_url ? (
                <img src={s.image_url} alt={s.headline} className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-slate-100">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              {/* Status badge */}
              <div className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {s.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {s.active ? "Visible" : "Hidden"}
              </div>
              {/* Sort order badge */}
              <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">#{s.sort_order}</div>
              <div className="p-4">
                <div className="truncate text-sm font-semibold text-[var(--brand-navy)]">{s.headline || <span className="italic text-muted-foreground">No headline</span>}</div>
                {s.subtext && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.subtext}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => startEdit(s)} className="flex-1 rounded border border-border py-1.5 text-xs font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-blue)] transition">
                    <Pencil className="mx-auto h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="flex-1 rounded border border-border py-1.5 text-xs font-semibold text-muted-foreground hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
                  >
                    {deletingId === s.id ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mx-auto h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
