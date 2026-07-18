import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar, Newspaper, FolderKanban, MessageSquare,
} from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { adminGetDashboardStats, type DashboardStats } from "@/lib/content-fn";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — UFF Admin" }] }),
  component: DashboardPage,
});

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className={`grid h-9 w-9 place-items-center rounded-full ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-extrabold text-[var(--brand-navy)]">{value}</div>
    </div>
  );
}

function DashboardPage() {
  const { token } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetDashboardStats({ data: { token } })
      .then((r) => setStats(r.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your site's content and activity.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-white border border-border shadow-sm" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            Content
          </div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={Calendar}     label="Events"   value={stats.eventCount}   color="bg-[var(--brand-blue)]" />
            <StatCard icon={Newspaper}    label="News Articles" value={stats.newsCount} color="bg-[var(--brand-green-dark)]" />
            <StatCard icon={FolderKanban} label="Projects" value={stats.projectCount} color="bg-[var(--brand-purple)]" />
          </div>

          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            Incoming
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={MessageSquare} label="Contact Submissions" value={stats.submissionCount} color="bg-[var(--brand-orange)]" />
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Failed to load stats.</p>
      )}
    </div>
  );
}
