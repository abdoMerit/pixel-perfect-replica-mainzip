import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, Save, X, Loader2, Image } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import {
  getPublicNews, adminCreateNews, adminUpdateNews, adminDeleteNews,
  type NewsArticle,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/news")({
  head: () => ({ meta: [{ title: "News — UFF Admin" }] }),
  component: NewsAdminPage,
});

type FormState = Omit<NewsArticle, "id"> & { id?: number };

const empty = (): FormState => ({
  title: "", published_date: "", excerpt: "", image_url: "", sort_order: 0,
});

function NewsAdminPage() {
  const { token } = useAdmin();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await getPublicNews();
      setArticles(r.articles);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startNew() { setForm(empty()); setError(null); }
  function startEdit(a: NewsArticle) { setForm({ ...a }); setError(null); }
  function cancelForm() { setForm(null); setError(null); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await adminUpdateNews({ data: { token, ...form, id: form.id } });
      } else {
        await adminCreateNews({ data: { token, ...form } });
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
    if (!confirm("Delete this article?")) return;
    setDeletingId(id);
    try {
      await adminDeleteNews({ data: { token, id } });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  function set(k: keyof FormState, v: string | number) {
    setForm((f) => f ? { ...f, [k]: v } : f);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">News Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
        </div>
        {!form && (
          <button onClick={startNew} className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition">
            <Plus className="h-4 w-4" /> New Article
          </button>
        )}
      </div>

      {form && (
        <div className="mb-6 rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--brand-navy)]">{form.id ? "Edit Article" : "New Article"}</h2>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" required value={form.published_date ?? ""} onChange={(e) => set("published_date", e.target.value)} />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input className="input" type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Image URL</label>
              <input className="input" placeholder="https://..." value={form.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Excerpt</label>
              <textarea className="input min-h-[80px] resize-y" value={form.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} />
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
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-white border border-border" />)}</div>
      ) : articles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">
          No articles yet. Click "New Article" to add one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Title", "Date", "Excerpt", "Image", "Order", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-[var(--brand-navy)] max-w-[200px] truncate">{a.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{a.published_date}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[220px] truncate">{a.excerpt}</td>
                  <td className="px-4 py-3">
                    {a.image_url ? (
                      <img src={a.image_url} alt="" className="h-10 w-14 rounded object-cover" />
                    ) : (
                      <span className="flex h-10 w-14 items-center justify-center rounded bg-slate-100 text-muted-foreground/50">
                        <Image className="h-4 w-4" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(a)} className="grid h-7 w-7 place-items-center rounded border border-border text-muted-foreground hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="grid h-7 w-7 place-items-center rounded border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 transition disabled:opacity-50">
                        {deletingId === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
