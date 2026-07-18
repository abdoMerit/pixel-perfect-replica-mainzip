import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  LogIn, LayoutDashboard, Calendar, Newspaper, FolderKanban,
  BookOpen, Settings2, MessageSquare, DollarSign, ChevronRight,
  LogOut, Menu, X, Home, Info,
} from "lucide-react";
import { AdminContext } from "@/lib/admin-context";
import { verifyAdminPassword } from "@/lib/content-fn";

export const Route = createFileRoute("/admin")({
  component: AdminLayoutRoute,
});

const NAV = [
  {
    label: "Overview",
    items: [{ icon: LayoutDashboard, label: "Dashboard", to: "/admin/dashboard" as const }],
  },
  {
    label: "Content",
    items: [
      { icon: Calendar,      label: "Events",    to: "/admin/events"    as const },
      { icon: Newspaper,     label: "News",      to: "/admin/news"      as const },
      { icon: FolderKanban,  label: "Projects",  to: "/admin/projects"  as const },
      { icon: BookOpen,      label: "Programs",  to: "/admin/programs"  as const },
    ],
  },
  {
    label: "Settings",
    items: [
      { icon: Home,     label: "Home Page",  to: "/admin/home-settings"  as const },
      { icon: Info,     label: "About Page", to: "/admin/about-settings" as const },
    ],
  },
  {
    label: "Data",
    items: [
      { icon: MessageSquare, label: "Submissions", to: "/admin/submissions" as const },
      { icon: DollarSign,    label: "Donations",   to: "/admin/donations"   as const },
    ],
  },
];

function AdminLayoutRoute() {
  const [password, setPassword] = useState<string>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("uff-admin-pw") ?? "" : ""),
  );
  const [authed, setAuthed] = useState<boolean>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("uff-admin-authed") === "1" : false),
  );
  const [inputPw, setInputPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyAdminPassword({ data: { password: inputPw } });
      sessionStorage.setItem("uff-admin-pw", inputPw);
      sessionStorage.setItem("uff-admin-authed", "1");
      setPassword(inputPw);
      setAuthed(true);
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    sessionStorage.removeItem("uff-admin-pw");
    sessionStorage.removeItem("uff-admin-authed");
    setAuthed(false);
    setPassword("");
    setInputPw("");
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <img src="/uff-icon.png" alt="UFF" className="mx-auto mb-4 h-14 w-14 rounded-full object-cover shadow" />
            <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Admin Panel</h1>
            <p className="mt-1 text-sm text-muted-foreground">Unique Future Foundation</p>
          </div>
          <form
            onSubmit={handleLogin}
            className="rounded-lg border border-border bg-white p-6 shadow-sm space-y-4"
          >
            <div>
              <label htmlFor="admin-pw" className="mb-1.5 block text-xs font-semibold text-[var(--brand-navy)]">
                Admin Password
              </label>
              <input
                id="admin-pw"
                type="password"
                required
                value={inputPw}
                onChange={(e) => setInputPw(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/20"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Verifying…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ password }}>
      <div className="flex min-h-screen bg-slate-100">
        {/* ── Sidebar ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[var(--brand-navy)] shadow-xl transition-transform duration-200 lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <img src="/uff-icon.png" alt="UFF" className="h-8 w-8 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-bold text-white">UFF Admin</div>
              <div className="text-[10px] text-white/50">Content Manager</div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-white/40 hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV.map((section) => (
              <div key={section.label} className="mb-5">
                <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                  {section.label}
                </div>
                {section.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeProps={{ className: "bg-white/15 text-white font-semibold" }}
                    inactiveProps={{ className: "text-white/65 hover:bg-white/10 hover:text-white" }}
                    className="mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Sign out */}
          <div className="border-t border-white/10 px-3 py-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Main ── */}
        <div className="flex min-h-screen flex-1 flex-col lg:ml-60">
          {/* Top bar */}
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-3 shadow-sm">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-[var(--brand-navy)] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-[var(--brand-navy)]">
              Unique Future Foundation
            </span>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--brand-navy)] transition-colors"
            >
              View Site <ChevronRight className="h-3.5 w-3.5" />
            </a>
            <Settings2 className="h-4 w-4 text-muted-foreground/50" />
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
