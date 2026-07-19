import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Check, Image } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { ImageUpload } from "@/components/image-upload";
import {
  adminGetGallery, adminCreateGalleryPhoto, adminUpdateGalleryPhoto, adminDeleteGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "Gallery — UFF Admin" }] }),
  component: AdminGalleryPage,
});

const CATEGORIES = ["General", "Education", "Health", "Environment", "Livelihood", "Events", "Projects"];

const BLANK = { image_url: "", caption: "", category: "General", sort_order: 0 };

function AdminGalleryPage() {
  const { token } = useAdmin();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState<GalleryPhoto | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    adminGetGallery({ data: { token } })
      .then((r) => setPhotos(r.photos))
      .catch(() => setErr("Failed to load gallery"))
      .finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  function openNew() {
    setEditing(null);
    setForm(BLANK);
    setErr(null);
    setShowForm(true);
  }

  function openEdit(p: GalleryPhoto) {
    setEditing(p);
    setForm({ image_url: p.image_url, caption: p.caption, category: p.category, sort_order: p.sort_order });
    setErr(null);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) { setErr("Please upload or enter a photo URL"); return; }
    setSaving(true); setErr(null);
    try {
      if (editing) {
        await adminUpdateGalleryPhoto({ data: { token, id: editing.id, ...form } });
      } else {
        await adminCreateGalleryPhoto({ data: { token, ...form } });
      }
      setShowForm(false);
      load();
    } catch (e: any) {
      setErr(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: number) {
    if (!confirm("Delete this photo?")) return;
    await adminDeleteGalleryPhoto({ data: { token, id } }).catch(() => {});
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage photos shown on the public Gallery page.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition">
          <Plus className="h-4 w-4" /> Add Photo
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={save} className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--brand-navy)]">{editing ? "Edit Photo" : "Add Photo"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>

            <div>
              <label className="label">Photo *</label>
              <ImageUpload value={form.image_url} onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Caption</label>
                <input
                  value={form.caption}
                  onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                  placeholder="Photo caption..."
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="input w-full"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                className="input w-32"
              />
            </div>

            {err && <p className="text-sm text-red-500">{err}</p>}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save Photo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-lg bg-white border border-border" />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <Image className="h-10 w-10 opacity-20" />
          <p className="text-sm">No photos yet. Click <strong>Add Photo</strong> to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              <img src={p.image_url} alt={p.caption} className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-xs font-medium text-[var(--brand-navy)]">{p.caption || "—"}</p>
                <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.category}</span>
              </div>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button type="button" onClick={() => openEdit(p)} className="grid h-7 w-7 place-items-center rounded bg-white shadow hover:bg-[var(--brand-navy)] hover:text-white">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => del(p.id)} className="grid h-7 w-7 place-items-center rounded bg-white shadow hover:bg-red-500 hover:text-white">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
