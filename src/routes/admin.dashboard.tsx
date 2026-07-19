import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar, Newspaper, FolderKanban, MessageSquare,
  GalleryHorizontal, FileText, Users, ArrowRight,
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
  to,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  to?: string;
}) {
  const inner = (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm hover:shadow-md transition group">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className={`grid h-9 w-9 place-items-center rounded-full ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-3xl font-extrabold text-[var(--brand-navy)]">{value}</div>
        {to && <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[var(--brand-green)] transition" />}
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function DashboardPage() {
  const { token, name } = useAdmin();
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
        <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">
          Welcome back{name ? `, ${name.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's an overview of everything on your site.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-white border border-border shadow-sm" />
          ))}
        </div>
      ) : stats ? (
        <>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Content</p>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={Calendar}     label="Events"        value={stats.eventCount}   color="bg-[var(--brand-blue)]"       to="/admin/events" />
            <StatCard icon={Newspaper}    label="News Articles" value={stats.newsCount}    color="bg-[var(--brand-green-dark)]" to="/admin/news" />
            <StatCard icon={FolderKanban} label="Projects"      value={stats.projectCount} color="bg-[var(--brand-purple)]"     to="/admin/projects" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Media & Publications</p>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={GalleryHorizontal} label="Gallery Photos" value={stats.galleryCount} color="bg-[var(--brand-orange)]"     to="/admin/gallery" />
            <StatCard icon={FileText}          label="Reports"        value={stats.reportCount}  color="bg-[var(--brand-green-dark)]" to="/admin/reports" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Incoming & Team</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={MessageSquare} label="Contact Submissions" value={stats.submissionCount} color="bg-[var(--brand-orange)]" to="/admin/submissions" />
            <StatCard icon={Users}         label="Staff Users"         value={stats.userCount}       color="bg-[var(--brand-navy)]"   to="/admin/users" />
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Failed to load stats.</p>
      )}
    </div>
  );
}
