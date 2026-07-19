import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2, ToggleLeft, ToggleRight, Link as LinkIcon } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { ImageUpload } from "@/components/image-upload";
import {
  adminGetPartners, adminCreatePartner, adminUpdatePartner, adminDeletePartner,
  type Partner,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Partners — UFF Admin" }] }),
  component: PartnersAdminPage,
});

type FormState = Omit<Partner, "id"> & { id?: number };

const empty = (): FormState => ({
  name: "", logo_url: "", website_url: "", sort_order: 0, active: true,
});

function PartnersAdminPage() {
  const { token } = useAdmin();
  const [items, setItems]           = useState<Partner[]>([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState<FormState | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError]           = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await adminGetPartners({ data: { token } });
      setItems(r.partners);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startNew()             { setForm(empty()); setError(null); }
  function startEdit(p: Partner)  { setForm({ ...p }); setError(null); }
  function cancelForm()           { setForm(null); setError(null); }

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
        await adminUpdatePartner({ data: { token, ...form, id: form.id } });
      } else {
        await adminCreatePartner({ data: { token, ...form } });
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
    if (!confirm("Remove this partner?")) return;
    setDeletingId(id);
    try {
      await adminDeletePartner({ data: { token, id } });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Partners</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the scrolling partner logo strip shown on the home page.</p>
        </div>
        {!form && (
          <button onClick={startNew} className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> Add Partner
          </button>
        )}
      </div>

      {/* Form */}
      {form && (
        <form onSubmit={handleSave} className="mb-6 rounded-lg border border-border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[var(--brand-navy)]">{form.id ? "Edit Partner" : "New Partner"}</h2>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[var(--brand-navy)] mb-1">Organisation Name *</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]" placeholder="e.g. UNICEF" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--brand-navy)] mb-1">Website URL</label>
              <input type="url" value={form.website_url} onChange={(e) => set("website_url", e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]" placeholder="https://example.org" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--brand-navy)] mb-1">Logo Image</label>
            <p className="text-[11px] text-muted-foreground mb-2">Upload a PNG or SVG logo. Recommended: transparent background, ~200×80 px.</p>
            <ImageUpload value={form.logo_url} onChange={(url) => set("logo_url", url)} />
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
              {form.id ? "Save Changes" : "Add Partner"}
            </button>
            <button type="button" onClick={cancelForm} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition">
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No partners yet. Click "Add Partner" to add your first one.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className={`flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm ${!p.active ? "opacity-50" : ""}`}>
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.name} className="h-10 w-20 object-contain shrink-0 rounded" />
              ) : (
                <div className="h-10 w-10 rounded bg-muted grid place-items-center shrink-0 text-xs font-bold text-muted-foreground">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[var(--brand-navy)] truncate">{p.name}</span>
                  {!p.active && <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5 shrink-0">Hidden</span>}
                </div>
                {p.website_url && (
                  <a href={p.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-[var(--brand-blue)] hover:underline truncate">
                    <LinkIcon className="h-3 w-3 shrink-0" /> {p.website_url.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className="h-8 w-8 grid place-items-center rounded border border-border hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                  className="h-8 w-8 grid place-items-center rounded border border-border hover:border-red-400 hover:text-red-500 transition disabled:opacity-50">
                  {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
