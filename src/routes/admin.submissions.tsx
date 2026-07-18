import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, User, MessageSquare, Calendar, Tag, Download, Loader2, RefreshCw } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { getSubmissions, exportSubmissionsCsv, type ContactSubmission } from "@/lib/contact-fn";

export const Route = createFileRoute("/admin/submissions")({
  head: () => ({ meta: [{ title: "Submissions — UFF Admin" }] }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const { password } = useAdmin();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await getSubmissions({ data: { password } });
      setSubmissions(r.submissions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const r = await exportSubmissionsCsv({ data: { password } });
      const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `uff-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Contact Submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">{submissions.length} message{submissions.length !== 1 ? "s" : ""} received</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 rounded border border-border bg-white px-3 py-2 text-xs text-muted-foreground hover:text-[var(--brand-navy)] transition disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-1.5 rounded border border-border bg-white px-3 py-2 text-xs text-muted-foreground hover:text-[var(--brand-navy)] transition disabled:opacity-50">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-white border border-border shadow-sm" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center shadow-sm">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold text-[var(--brand-navy)]">
                    <User className="h-4 w-4 text-[var(--brand-green-dark)]" /> {sub.name}
                  </span>
                  <a href={`mailto:${sub.email}`} className="flex items-center gap-1.5 text-[var(--brand-green-dark)] hover:underline">
                    <Mail className="h-4 w-4" /> {sub.email}
                  </a>
                  {sub.subject && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Tag className="h-4 w-4" /> {sub.subject}
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(sub.submitted_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded bg-slate-50 px-4 py-3 text-sm leading-relaxed border border-border">
                {sub.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
