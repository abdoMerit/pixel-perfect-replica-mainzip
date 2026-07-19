import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Check, FileText, Upload } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import {
  adminGetReports, adminCreateReport, adminUpdateReport, adminDeleteReport,
  type CmsReport,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — UFF Admin" }] }),
  component: AdminReportsPage,
});

const REPORT_TYPES = ["Annual Report", "Program Report", "Profile", "Field Report", "Financial Report", "Other"];

const BLANK = { title: "", year: new Date().getFullYear().toString(), report_type: "Annual Report", description: "", file_url: "", sort_order: 0 };

function AdminReportsPage() {
  const { token } = useAdmin();
  const [reports, setReports] = useState<CmsReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState<CmsReport | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    adminGetReports({ data: { token } })
      .then((r) => setReports(r.reports))
      .catch(() => setErr("Failed to load reports"))
      .finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  function openNew() {
    setEditing(null);
    setForm(BLANK);
    setErr(null);
    setShowForm(true);
  }

  function openEdit(r: CmsReport) {
    setEditing(r);
    setForm({ title: r.title, year: r.year, report_type: r.report_type, description: r.description, file_url: r.file_url, sort_order: r.sort_order });
    setErr(null);
    setShowForm(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setErr("File too large (max 50 MB)"); return; }
    setUploading(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (json.error) throw new Error(json.error);
      setForm((f) => ({ ...f, file_url: json.url! }));
    } catch (e: any) {
      setErr(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setErr("Title is required"); return; }
    setSaving(true); setErr(null);
    try {
      if (editing) {
        await adminUpdateReport({ data: { token, id: editing.id, ...form } });
      } else {
        await adminCreateReport({ data: { token, ...form } });
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
    if (!confirm("Delete this report?")) return;
    await adminDeleteReport({ data: { token, id } }).catch(() => {});
    load();
  }

  const TYPE_COLORS: Record<string, string> = {
    "Annual Report":    "bg-[var(--brand-green-dark)] text-white",
    "Program Report":   "bg-[var(--brand-blue)] text-white",
    "Profile":          "bg-[var(--brand-orange)] text-white",
    "Field Report":     "bg-purple-600 text-white",
    "Financial Report": "bg-slate-600 text-white",
    "Other":            "bg-slate-400 text-white",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Reports & Publications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage downloadable reports shown on the public Reports page.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition">
          <Plus className="h-4 w-4" /> Add Report
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={save} className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--brand-navy)]">{editing ? "Edit Report" : "Add Report"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>

            <div>
              <label className="label">Title *</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="UFF Annual Report 2024" className="input w-full" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Year</label>
                <input value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="2024" className="input w-full" />
              </div>
              <div>
                <label className="label">Type</label>
                <select value={form.report_type} onChange={(e) => setForm((f) => ({ ...f, report_type: e.target.value }))} className="input w-full">
                  {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Brief description of this report..." className="input w-full" />
            </div>

            <div>
              <label className="label">PDF / File</label>
              <div className="flex items-center gap-3">
                <input
                  value={form.file_url}
                  onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                  placeholder="Paste URL or upload a file below"
                  className="input flex-1"
                />
              </div>
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded border border-dashed border-border bg-slate-50 px-3 py-2.5 text-xs text-muted-foreground hover:border-[var(--brand-green)] transition">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : form.file_url ? "Replace file" : "Upload PDF / file"}
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} disabled={uploading} />
              </label>
              {form.file_url && (
                <a href={form.file_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-[var(--brand-green-dark)] underline underline-offset-2">{form.file_url}</a>
              )}
            </div>

            <div>
              <label className="label">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="input w-32" />
            </div>

            {err && <p className="text-sm text-red-500">{err}</p>}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save Report"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-white border border-border" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <FileText className="h-10 w-10 opacity-20" />
          <p className="text-sm">No reports yet. Click <strong>Add Report</strong> to get started.</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-white shadow-sm">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)]/10">
                  <FileText className="h-5 w-5 text-[var(--brand-green-dark)]" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[var(--brand-navy)]">{r.title}</p>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${TYPE_COLORS[r.report_type] ?? "bg-slate-200 text-slate-700"}`}>{r.report_type}</span>
                    {r.year && <span className="text-[11px] text-muted-foreground">{r.year}</span>}
                  </div>
                  {r.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.description}</p>}
                  {r.file_url && <a href={r.file_url} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-[11px] text-[var(--brand-green-dark)] underline underline-offset-1">📎 {r.file_url}</a>}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => openEdit(r)} className="rounded border border-border p-2 text-muted-foreground hover:bg-slate-50 hover:text-[var(--brand-navy)] transition">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => del(r.id)} className="rounded border border-border p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
