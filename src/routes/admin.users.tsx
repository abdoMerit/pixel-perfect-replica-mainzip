import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2, ShieldCheck, Shield, X, Check, Users } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { adminListUsers, adminCreateUser, adminUpdateUserRole, adminDeleteUser, type StaffUser } from "@/lib/auth-fn";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — UFF Admin" }] }),
  component: AdminUsersPage,
});

const ROLES = [
  { value: "admin",  label: "Admin",  desc: "Full access — can manage all content and users",  icon: ShieldCheck, color: "text-[var(--brand-green-dark)]" },
  { value: "editor", label: "Editor", desc: "Can manage content, but cannot manage users",        icon: Shield,      color: "text-[var(--brand-blue)]" },
];

const BLANK = { name: "", email: "", password: "", role: "editor" };

function AdminUsersPage() {
  const { token, email: myEmail } = useAdmin();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    adminListUsers({ data: { token } })
      .then((r) => setUsers(r.users))
      .catch(() => setErr("Failed to load users"))
      .finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  async function changeRole(id: number, role: string) {
    await adminUpdateUserRole({ data: { token, id, role } }).catch((e: any) => alert(e.message));
    load();
  }

  async function del(id: number) {
    if (!confirm("Delete this user? They will no longer be able to log in.")) return;
    try {
      await adminDeleteUser({ data: { token, id } });
      load();
    } catch (e: any) {
      alert(e.message ?? "Failed to delete user");
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setErr("All fields are required"); return; }
    setSaving(true); setErr(null);
    try {
      await adminCreateUser({ data: { token, ...form } });
      setShowForm(false);
      setForm(BLANK);
      load();
    } catch (e: any) {
      setErr(e.message ?? "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Users & Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage staff accounts and their permission levels.</p>
        </div>
        <button onClick={() => { setShowForm(true); setErr(null); setForm(BLANK); }} className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Role legend */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {ROLES.map((r) => (
          <div key={r.value} className="flex items-start gap-3 rounded-lg border border-border bg-white p-4 shadow-sm">
            <r.icon className={`mt-0.5 h-5 w-5 shrink-0 ${r.color}`} />
            <div>
              <p className="text-sm font-semibold text-[var(--brand-navy)]">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={create} className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--brand-navy)]">Add New Staff User</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>

            <div>
              <label className="label">Full Name *</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" className="input w-full" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" className="input w-full" />
            </div>
            <div>
              <label className="label">Temporary Password *</label>
              <input required type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="At least 6 characters" className="input w-full" />
            </div>
            <div>
              <label className="label">Role</label>
              <div className="mt-1 flex gap-3">
                {ROLES.map((r) => (
                  <label key={r.value} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 transition ${form.role === r.value ? "border-[var(--brand-green)] bg-[var(--brand-green)]/5" : "border-border hover:border-slate-300"}`}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={() => setForm((f) => ({ ...f, role: r.value }))} className="sr-only" />
                    <r.icon className={`h-4 w-4 ${r.color}`} />
                    <span className="text-sm font-medium">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {err && <p className="text-sm text-red-500">{err}</p>}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <Check className="h-4 w-4" /> {saving ? "Creating…" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-white" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <Users className="h-10 w-10 opacity-20" />
          <p className="text-sm">No staff users found.</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-white shadow-sm">
          {users.map((u) => {
            const isMe = u.email === myEmail;
            const roleInfo = ROLES.find((r) => r.value === u.role) ?? ROLES[1];
            return (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)]/10 text-sm font-bold text-[var(--brand-navy)] uppercase">
                    {u.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--brand-navy)]">
                      {u.name} {isMe && <span className="ml-1 rounded bg-[var(--brand-green)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--brand-green-dark)]">You</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role selector */}
                  <div className="flex items-center gap-1.5">
                    <roleInfo.icon className={`h-4 w-4 ${roleInfo.color}`} />
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      disabled={isMe}
                      className="rounded border border-border bg-white px-2 py-1.5 text-xs font-medium text-[var(--brand-navy)] focus:border-[var(--brand-green)] focus:outline-none disabled:opacity-50"
                    >
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => del(u.id)}
                    disabled={isMe}
                    title={isMe ? "You cannot delete your own account" : "Delete user"}
                    className="rounded border border-border p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
