import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LogIn, UserPlus, LayoutDashboard, Calendar, Newspaper, FolderKanban,
  BookOpen, MessageSquare, DollarSign, ChevronRight,
  LogOut, Menu, Home, Info, Images, Phone,
} from "lucide-react";
import { AdminContext } from "@/lib/admin-context";
import { staffLogin, staffRegister } from "@/lib/auth-fn";

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
      { icon: Calendar,     label: "Events",   to: "/admin/events"   as const },
      { icon: Newspaper,    label: "News",     to: "/admin/news"     as const },
      { icon: FolderKanban, label: "Projects", to: "/admin/projects" as const },
      { icon: BookOpen,     label: "Programs", to: "/admin/programs" as const },
    ],
  },
  {
    label: "Settings",
    items: [
      { icon: Home, label: "Home Page",  to: "/admin/home-settings"  as const },
      { icon: Info, label: "About Page", to: "/admin/about-settings" as const },
    ],
  },
  {
    label: "Media",
    items: [
      { icon: Images, label: "Hero Slides",   to: "/admin/hero-slides"       as const },
      { icon: Phone,  label: "Contact & Info", to: "/admin/contact-settings" as const },
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

// ── Auth screen ───────────────────────────────────────────────────────────────

type Tab = "login" | "register";

function AuthScreen({
  onAuth,
}: {
  onAuth: (token: string, email: string, name: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw]       = useState("");

  // Register state
  const [regName,  setRegName]  = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw,    setRegPw]    = useState("");
  const [regPw2,   setRegPw2]   = useState("");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await staffLogin({ data: { email: loginEmail, password: loginPw } });
      onAuth(r.token, r.email, r.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (regPw !== regPw2) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const r = await staffRegister({ data: { name: regName, email: regEmail, password: regPw } });
      onAuth(r.token, r.email, r.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/20";
  const labelCls = "mb-1.5 block text-xs font-semibold text-[var(--brand-navy)]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <img
            src="/uff-icon.png"
            alt="UFF"
            className="mx-auto mb-4 h-16 w-16 rounded-full object-cover shadow-md"
          />
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">
            Staff Portal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Unique Future Foundation</p>
        </div>

        {/* Tab switcher */}
        <div className="mb-5 flex rounded-lg border border-border bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => { setTab("login"); setError(null); setSuccess(null); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition ${
              tab === "login"
                ? "bg-[var(--brand-navy)] text-white shadow"
                : "text-muted-foreground hover:text-[var(--brand-navy)]"
            }`}
          >
            <LogIn className="h-4 w-4" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setError(null); setSuccess(null); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition ${
              tab === "register"
                ? "bg-[var(--brand-navy)] text-white shadow"
                : "text-muted-foreground hover:text-[var(--brand-navy)]"
            }`}
          >
            <UserPlus className="h-4 w-4" /> Register
          </button>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          {/* ── Login form ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input
                  type="password"
                  required
                  value={loginPw}
                  onChange={(e) => setLoginPw(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={inputCls}
                />
              </div>
              {error && (
                <p className="rounded bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setTab("register"); setError(null); }}
                  className="font-semibold text-[var(--brand-green-dark)] hover:underline"
                >
                  Register here
                </button>
              </p>
            </form>
          )}

          {/* ── Register form ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPw}
                  onChange={(e) => setRegPw(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPw2}
                  onChange={(e) => setRegPw2(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={inputCls}
                />
              </div>
              {error && (
                <p className="rounded bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                  {success}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-green)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating account…" : "Create Account"}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setTab("login"); setError(null); }}
                  className="font-semibold text-[var(--brand-green-dark)] hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-[var(--brand-navy)]">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}

// ── Admin layout (authenticated) ──────────────────────────────────────────────

function AdminLayoutRoute() {
  // Always start with empty session so server and client render the same
  // initial HTML (auth screen). After mount, restore from sessionStorage.
  const [session, setSession] = useState({ token: "", email: "", name: "" });
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("uff-admin-token") ?? "";
    const email = sessionStorage.getItem("uff-admin-email") ?? "";
    const name  = sessionStorage.getItem("uff-admin-name")  ?? "";
    if (token) setSession({ token, email, name });
    setHydrated(true);
  }, []);

  // Show nothing until we've checked sessionStorage to avoid flash of auth screen
  if (!hydrated) return null;

  const authed = Boolean(session.token);

  function handleAuth(token: string, email: string, name: string) {
    sessionStorage.setItem("uff-admin-token", token);
    sessionStorage.setItem("uff-admin-email", email);
    sessionStorage.setItem("uff-admin-name",  name);
    setSession({ token, email, name });
  }

  function handleSignOut() {
    sessionStorage.removeItem("uff-admin-token");
    sessionStorage.removeItem("uff-admin-email");
    sessionStorage.removeItem("uff-admin-name");
    setSession({ token: "", email: "", name: "" });
  }

  if (!authed) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <AdminContext.Provider value={session}>
      <div className="flex min-h-screen bg-slate-50">
        {/* ── Sidebar ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[var(--brand-navy-deep)] transition-transform duration-200
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <img src="/uff-icon.png" alt="UFF" className="h-8 w-8 rounded-full object-cover" />
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">UFF Admin</div>
              <div className="text-[10px] text-white/50">Staff Portal</div>
            </div>
          </div>

          {/* User badge */}
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand-green)] text-xs font-bold text-white">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white">{session.name}</div>
              <div className="truncate text-[10px] text-white/50">{session.email}</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV.map((group) => (
              <div key={group.label} className="mb-5">
                <div className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-widest text-white/40">
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    activeOptions={{ exact: false }}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors data-[status=active]:bg-white/15 data-[status=active]:text-white"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 px-3 py-3 space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" /> View Website
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
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
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Welcome, {session.name}
              </span>
              <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-green)] text-xs font-bold text-white">
                {session.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
