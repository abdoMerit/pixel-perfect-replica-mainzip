import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { ImageUpload } from "@/components/image-upload";
import {
  adminGetTestimonials, adminCreateTestimonial, adminUpdateTestimonial, adminDeleteTestimonial,
  type Testimonial,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials — UFF Admin" }] }),
  component: TestimonialsAdminPage,
});

type FormState = Omit<Testimonial, "id"> & { id?: number };

const empty = (): FormState => ({
  name: "", role: "", quote: "", avatar_url: "", sort_order: 0, active: true,
});

function TestimonialsAdminPage() {
  const { token } = useAdmin();
  const [items, setItems]         = useState<Testimonial[]>([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState<FormState | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await adminGetTestimonials({ data: { token } });
      setItems(r.testimonials);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startNew()               { setForm(empty()); setError(null); }
  function startEdit(t: Testimonial){ setForm({ ...t }); setError(null); }
  function cancelForm()             { setForm(null); setError(null); }

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => f ? { ...f, [k]: v } : f);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await adminUpdateTestimonial({ data: { token, ...form, id: form.id } });
      } else {
        await adminCreateTestimonial({ data: { token, ...form } });
      }
      setForm(null);
      await load();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this testimonial?")) return;
    setDeletingId(id);
    try {
      await adminDeleteTestimonial({ data: { token, id } });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the scrolling testimonial cards shown on the home page.</p>
        </div>
        {!form && (
          <button onClick={startNew} className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> Add Testimonial
          </button>
        )}
      </div>

      {/* Form */}
      {form && (
        <form onSubmit={handleSave} className="mb-6 rounded-lg border border-border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[var(--brand-navy)]">{form.id ? "Edit Testimonial" : "New Testimonial"}</h2>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[var(--brand-navy)] mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]" placeholder="e.g. Amina Hassan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--brand-navy)] mb-1">Role / Organisation</label>
              <input value={form.role} onChange={(e) => set("role", e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]" placeholder="e.g. Community Leader, Mogadishu" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--brand-navy)] mb-1">Quote *</label>
            <textarea required rows={4} value={form.quote} onChange={(e) => set("quote", e.target.value)}
              className="w-full rounded border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] resize-none"
              placeholder="Write their testimonial here…" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--brand-navy)] mb-1">Avatar Photo (optional)</label>
            <ImageUpload value={form.avatar_url} onChange={(url) => set("avatar_url", url)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[var(--brand-navy)] mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
                className="w-full rounded border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]" />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => set("active", !form.active)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border transition ${form.active ? "bg-[var(--brand-green)]/10 border-[var(--brand-green)] text-[var(--brand-green-dark)]" : "bg-muted border-border text-muted-foreground"}`}>
                {form.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                {form.active ? "Visible on site" : "Hidden from site"}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-navy)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {form.id ? "Save Changes" : "Create Testimonial"}
            </button>
            <button type="button" onClick={cancelForm} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition">
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No testimonials yet. Click "Add Testimonial" to create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className={`flex items-start gap-4 rounded-lg border bg-white p-4 shadow-sm ${!t.active ? "opacity-50" : ""}`}>
              {t.avatar_url ? (
                <img src={t.avatar_url} alt={t.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--brand-green)]/30 shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[var(--brand-green)] grid place-items-center text-xs font-bold text-white shrink-0">
                  {t.name.split(" ").map((w) => w[0]).slice(0,2).join("").toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[var(--brand-navy)]">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.role}</span>
                  {!t.active && <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">Hidden</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.quote}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(t)} className="h-8 w-8 grid place-items-center rounded border border-border hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id}
                  className="h-8 w-8 grid place-items-center rounded border border-border hover:border-red-400 hover:text-red-500 transition disabled:opacity-50">
                  {deletingId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
