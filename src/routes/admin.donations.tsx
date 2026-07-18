import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Lock,
  LogIn,
  DollarSign,
  User,
  Mail,
  Calendar,
  Download,
  CheckCircle,
} from "lucide-react";
import { getDonations, exportDonationsCsv, type Donation } from "@/lib/donations-fn";

export const Route = createFileRoute("/admin/donations")({
  head: () => ({
    meta: [{ title: "Admin — Donations" }],
  }),
  component: AdminDonationsPage,
});

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function AdminDonationsPage() {
  const [password, setPassword] = useState("");
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await getDonations({ data: { password } });
      setDonations(result.donations);
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const result = await exportDonationsCsv({ data: { password } });
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `uff-donations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const totalRaised =
    donations?.reduce((sum, d) => sum + d.amount_cents, 0) ?? 0;

  if (donations === null) {
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
              Enter the admin password to view donations.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="w-full rounded border border-border bg-white px-4 py-3 text-sm outline-none focus:border-[var(--brand-green)]"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-navy)] py-3 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[var(--brand-navy)] px-6 py-5 shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-extrabold text-white">
              Donations
            </h1>
            <p className="mt-0.5 text-xs text-white/70">
              {donations.length} donation{donations.length !== 1 ? "s" : ""} ·{" "}
              {fmt(totalRaised, "usd")} total raised
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button
              type="button"
              onClick={() => { setDonations(null); setPassword(""); }}
              className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {donations.length === 0 ? (
          <div className="rounded-lg border border-border bg-white p-16 text-center shadow-sm">
            <DollarSign className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">No donations yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Donor", "Amount", "Status", "Date", "Stripe Session"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-[var(--brand-navy)]">
                        <User className="h-3.5 w-3.5 text-[var(--brand-green-dark)]" />
                        {d.donor_name ?? "Anonymous"}
                      </div>
                      {d.donor_email && (
                        <a
                          href={`mailto:${d.donor_email}`}
                          className="mt-0.5 flex items-center gap-1 text-xs text-[var(--brand-green-dark)] hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {d.donor_email}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--brand-navy)]">
                      {fmt(d.amount_cents, d.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(d.created_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                      {d.stripe_session_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

