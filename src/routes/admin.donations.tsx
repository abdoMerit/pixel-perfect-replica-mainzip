import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DollarSign, User, Mail, Calendar, Download, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { getDonations, exportDonationsCsv, type Donation } from "@/lib/donations-fn";

export const Route = createFileRoute("/admin/donations")({
  head: () => ({ meta: [{ title: "Donations — UFF Admin" }] }),
  component: DonationsPage,
});

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function DonationsPage() {
  const { password } = useAdmin();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await getDonations({ data: { password } });
      setDonations(r.donations);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const r = await exportDonationsCsv({ data: { password } });
      const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8;" });
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

  const totalRaised = donations.reduce((s, d) => s + d.amount_cents, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Donations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {donations.length} donation{donations.length !== 1 ? "s" : ""} · {fmt(totalRaised, "usd")} total
          </p>
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
        <div className="h-48 animate-pulse rounded-lg bg-white border border-border shadow-sm" />
      ) : donations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center shadow-sm">
          <DollarSign className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">No donations yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Donor", "Amount", "Status", "Date", "Stripe Session"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium text-[var(--brand-navy)]">
                      <User className="h-3.5 w-3.5 text-[var(--brand-green-dark)]" /> {d.donor_name ?? "Anonymous"}
                    </div>
                    {d.donor_email && (
                      <a href={`mailto:${d.donor_email}`} className="mt-0.5 flex items-center gap-1 text-xs text-[var(--brand-green-dark)] hover:underline">
                        <Mail className="h-3 w-3" /> {d.donor_email}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--brand-navy)]">{fmt(d.amount_cents, d.currency)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" /> {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(d.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground truncate max-w-[180px]">{d.stripe_session_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
