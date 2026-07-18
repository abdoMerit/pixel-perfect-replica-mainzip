import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Save, X, Loader2, Image, Tag } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { ImageUpload } from "@/components/image-upload";
import {
  getPublicProjects, adminCreateProject, adminUpdateProject, adminDeleteProject,
  type CmsProject,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({ meta: [{ title: "Projects — UFF Admin" }] }),
  component: ProjectsAdminPage,
});

type FormState = Omit<CmsProject, "id"> & { id?: number };

const empty = (): FormState => ({
  title: "", location: "", category: "", image_url: "", sort_order: 0,
});

const CATEGORIES = ["Education", "Health", "Environment", "Livelihood", "Other"];

function ProjectsAdminPage() {
  const { token } = useAdmin();
  const [projects, setProjects] = useState<CmsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await getPublicProjects();
      setProjects(r.projects);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startNew() { setForm(empty()); setError(null); }
  function startEdit(p: CmsProject) { setForm({ ...p }); setError(null); }
  function cancelForm() { setForm(null); setError(null); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await adminUpdateProject({ data: { token, ...form, id: form.id } });
      } else {
        await adminCreateProject({ data: { token, ...form } });
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
    if (!confirm("Delete this project?")) return;
    setDeletingId(id);
    try {
      await adminDeleteProject({ data: { token, id } });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  function set(k: keyof FormState, v: string | number) {
    setForm((f) => f ? { ...f, [k]: v } : f);
  }

  const catColor: Record<string, string> = {
    Education: "bg-blue-100 text-blue-700",
    Health: "bg-orange-100 text-orange-700",
    Environment: "bg-green-100 text-green-700",
    Livelihood: "bg-purple-100 text-purple-700",
    Other: "bg-slate-100 text-slate-600",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {!form && (
          <button onClick={startNew} className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition">
            <Plus className="h-4 w-4" /> New Project
          </button>
        )}
      </div>

      {form && (
        <div className="mb-6 rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--brand-navy)]">{form.id ? "Edit Project" : "New Project"}</h2>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="City, Country" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category ?? ""} onChange={(e) => set("category", e.target.value)}>
                <option value="">— Select —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Project Image"
                value={form.image_url ?? ""}
                onChange={(url) => set("image_url", url)}
              />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input className="input" type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
            </div>
            {error && <p className="sm:col-span-2 text-xs text-red-600">{error}</p>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={cancelForm} className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-slate-50 transition">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map((i) => <div key={i} className="h-52 animate-pulse rounded-lg bg-white border border-border" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">
          No projects yet. Click "New Project" to add one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-slate-100">
                  <Image className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-4">
                {p.category && (
                  <span className={`mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${catColor[p.category] ?? catColor["Other"]}`}>
                    {p.category}
                  </span>
                )}
                <div className="font-semibold text-sm text-[var(--brand-navy)] leading-snug">{p.title}</div>
                {p.location && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.location}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-red-400 hover:text-red-500 transition disabled:opacity-50">
                    {deletingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
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
