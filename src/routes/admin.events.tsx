import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, Clock, MapPin, Save, X, Loader2 } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import {
  getPublicEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent,
  type CmsEvent,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events — UFF Admin" }] }),
  component: EventsAdminPage,
});

type FormState = Omit<CmsEvent, "id"> & { id?: number };

const empty = (): FormState => ({
  title: "", event_date: "", event_time: "", location: "", description: "", sort_order: 0,
});

function EventsAdminPage() {
  const { token } = useAdmin();
  const [events, setEvents] = useState<CmsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null); // null = list view
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await getPublicEvents();
      setEvents(r.events);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startNew() { setForm(empty()); setError(null); }
  function startEdit(e: CmsEvent) { setForm({ ...e }); setError(null); }
  function cancelForm() { setForm(null); setError(null); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await adminUpdateEvent({ data: { token, ...form, id: form.id, sort_order: form.sort_order ?? 0 } });
      } else {
        await adminCreateEvent({ data: { token, ...form, sort_order: form.sort_order ?? 0 } });
      }
      setForm(null);
      await load();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this event?")) return;
    setDeletingId(id);
    try {
      await adminDeleteEvent({ data: { token, id } });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  function set(k: keyof FormState, v: string | number) {
    setForm((f) => f ? { ...f, [k]: v } : f);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">{events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        {!form && (
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4" /> New Event
          </button>
        )}
      </div>

      {/* Form */}
      {form && (
        <div className="mb-6 rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--brand-navy)]">
            {form.id ? "Edit Event" : "New Event"}
          </h2>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" required value={form.event_date ?? ""} onChange={(e) => set("event_date", e.target.value)} />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" placeholder="e.g. 6:00 PM" value={form.event_time ?? ""} onChange={(e) => set("event_time", e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="City, Country / Online" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input className="input" type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input min-h-[80px] resize-y" value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </div>
            {error && <p className="sm:col-span-2 text-xs text-red-600">{error}</p>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={cancelForm} className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-slate-50 transition">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-white border border-border" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">
          No events yet. Click "New Event" to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-white p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[var(--brand-navy)] truncate">{ev.title}</div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{ev.event_date}</span>
                  {ev.event_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.event_time}</span>}
                  {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                </div>
                {ev.description && <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{ev.description}</p>}
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button onClick={() => startEdit(ev)} className="grid h-8 w-8 place-items-center rounded border border-border text-muted-foreground hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  disabled={deletingId === ev.id}
                  className="grid h-8 w-8 place-items-center rounded border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
                >
                  {deletingId === ev.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
