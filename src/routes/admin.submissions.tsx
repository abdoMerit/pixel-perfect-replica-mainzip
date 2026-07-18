import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, LogIn, Mail, User, MessageSquare, Calendar, Tag } from "lucide-react";
import { getSubmissions, type ContactSubmission } from "@/lib/contact-fn";

export const Route = createFileRoute("/admin/submissions")({
  head: () => ({
    meta: [{ title: "Admin — Contact Submissions" }],
  }),
  component: AdminSubmissionsPage,
});

function AdminSubmissionsPage() {
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState<ContactSubmission[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await getSubmissions({ data: { password } });
      setSubmissions(result.submissions);
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Login screen
  if (submissions === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--brand-navy)]">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">
              Admin Access
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the admin password to view contact submissions.
            </p>
          </div>
          <form
            onSubmit={handleLogin}
            className="rounded-lg border border-border bg-white p-6 shadow-sm space-y-4"
          >
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-[var(--brand-navy)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/20"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Sign In"} <LogIn className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Submissions table
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[var(--brand-navy)] px-6 py-5 shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-extrabold text-white">
              Contact Submissions
            </h1>
            <p className="mt-0.5 text-xs text-white/70">
              {submissions.length} message{submissions.length !== 1 ? "s" : ""} received
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setSubmissions(null); setPassword(""); }}
            className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {submissions.length === 0 ? (
          <div className="rounded-lg border border-border bg-white p-16 text-center shadow-sm">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-lg border border-border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5 font-semibold text-[var(--brand-navy)]">
                      <User className="h-4 w-4 text-[var(--brand-green-dark)]" />
                      {sub.name}
                    </span>
                    <a
                      href={`mailto:${sub.email}`}
                      className="flex items-center gap-1.5 text-[var(--brand-green-dark)] hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {sub.email}
                    </a>
                    {sub.subject && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        {sub.subject}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(sub.submitted_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-wrap rounded bg-slate-50 px-4 py-3 text-sm text-foreground leading-relaxed border border-border">
                  {sub.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
