import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2, X } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { ImageUpload } from "@/components/image-upload";
import {
  getPublicPrograms,
  adminCreateProgram,
  adminUpdateProgram,
  adminDeleteProgram,
  type ProgramData,
} from "@/lib/content-fn";

export const Route = createFileRoute("/admin/programs")({
  head: () => ({ meta: [{ title: "Programs — UFF Admin" }] }),
  component: ProgramsAdminPage,
});

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const emptyProgram = (): ProgramData => ({
  slug: "",
  title: "",
  tagline: null,
  summary: null,
  image_url: "",
  video_url: "",
  highlights: [],
  stats: [],
});

function ProgramsAdminPage() {
  const { token } = useAdmin();
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, ProgramData>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New program form
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<ProgramData>(emptyProgram());
  const [creatingNew, setCreatingNew] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await getPublicPrograms();
      setPrograms(r.programs);
      const f: Record<string, ProgramData> = {};
      for (const p of r.programs) f[p.slug] = { ...p };
      setForms(f);
      if (!active && r.programs.length > 0) setActive(r.programs[0].slug);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Existing program field helpers ────────────────────────────────────────

  function setField(slug: string, key: keyof ProgramData, value: unknown) {
    setForms((f) => ({ ...f, [slug]: { ...f[slug], [key]: value } }));
  }

  function updateHighlight(slug: string, idx: number, key: "title" | "text", val: string) {
    const h = [...(forms[slug]?.highlights ?? [])];
    h[idx] = { ...h[idx], [key]: val };
    setField(slug, "highlights", h);
  }
  function addHighlight(slug: string) {
    setField(slug, "highlights", [...(forms[slug]?.highlights ?? []), { title: "", text: "" }]);
  }
  function removeHighlight(slug: string, idx: number) {
    setField(slug, "highlights", (forms[slug]?.highlights ?? []).filter((_, i) => i !== idx));
  }

  function updateStat(slug: string, idx: number, key: "n" | "l", val: string) {
    const s = [...(forms[slug]?.stats ?? [])];
    s[idx] = { ...s[idx], [key]: val };
    setField(slug, "stats", s);
  }
  function addStat(slug: string) {
    setField(slug, "stats", [...(forms[slug]?.stats ?? []), { n: "", l: "" }]);
  }
  function removeStat(slug: string, idx: number) {
    setField(slug, "stats", (forms[slug]?.stats ?? []).filter((_, i) => i !== idx));
  }

  async function handleSave(slug: string) {
    const f = forms[slug];
    if (!f) return;
    setSaving(slug); setError(null);
    try {
      await adminUpdateProgram({ data: { token, ...f } });
      setSaved(slug);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete the "${slug}" program? This cannot be undone.`)) return;
    setDeletingSlug(slug);
    try {
      await adminDeleteProgram({ data: { token, slug } });
      setActive(null);
      await load();
    } catch {
      setError("Failed to delete.");
    } finally {
      setDeletingSlug(null);
    }
  }

  // ── New program helpers ───────────────────────────────────────────────────

  function setNewField(key: keyof ProgramData, value: unknown) {
    setNewForm((f) => {
      const updated = { ...f, [key]: value };
      // Auto-generate slug from title
      if (key === "title" && typeof value === "string") {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  function updateNewHighlight(idx: number, key: "title" | "text", val: string) {
    const h = [...(newForm.highlights ?? [])];
    h[idx] = { ...h[idx], [key]: val };
    setNewField("highlights", h);
  }
  function addNewHighlight() {
    setNewField("highlights", [...(newForm.highlights ?? []), { title: "", text: "" }]);
  }
  function removeNewHighlight(idx: number) {
    setNewField("highlights", (newForm.highlights ?? []).filter((_, i) => i !== idx));
  }

  function updateNewStat(idx: number, key: "n" | "l", val: string) {
    const s = [...(newForm.stats ?? [])];
    s[idx] = { ...s[idx], [key]: val };
    setNewField("stats", s);
  }
  function addNewStat() {
    setNewField("stats", [...(newForm.stats ?? []), { n: "", l: "" }]);
  }
  function removeNewStat(idx: number) {
    setNewField("stats", (newForm.stats ?? []).filter((_, i) => i !== idx));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.title.trim()) { setNewError("Title is required."); return; }
    if (!newForm.slug.trim()) { setNewError("Slug is required."); return; }
    if (programs.find((p) => p.slug === newForm.slug)) {
      setNewError("A program with this slug already exists.");
      return;
    }
    setCreatingNew(true); setNewError(null);
    try {
      await adminCreateProgram({ data: { token, ...newForm } });
      setShowNew(false);
      setNewForm(emptyProgram());
      await load();
      setActive(newForm.slug);
    } catch {
      setNewError("Failed to create program. The slug may already be in use.");
    } finally {
      setCreatingNew(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-white border border-border" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Programs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit content, images, stats and highlights for each program.</p>
        </div>
        {!showNew && (
          <button
            onClick={() => { setShowNew(true); setNewForm(emptyProgram()); setNewError(null); }}
            className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4" /> New Program
          </button>
        )}
      </div>

      {/* ── New Program Form ─────────────────────────────────────────────── */}
      {showNew && (
        <div className="mb-6 rounded-lg border border-[var(--brand-navy)]/30 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--brand-navy)]">New Program</h2>
            <button
              onClick={() => setShowNew(false)}
              className="grid h-8 w-8 place-items-center rounded border border-border text-muted-foreground hover:bg-slate-50 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Title *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Water & Sanitation"
                  value={newForm.title}
                  onChange={(e) => setNewField("title", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Slug (URL key) *</label>
                <input
                  className="input font-mono text-sm"
                  required
                  placeholder="e.g. water-sanitation"
                  value={newForm.slug}
                  onChange={(e) => setNewField("slug", slugify(e.target.value))}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Auto-filled from title. Must be unique.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Tagline</label>
                <input
                  className="input"
                  placeholder="Short phrase shown on cards"
                  value={newForm.tagline ?? ""}
                  onChange={(e) => setNewField("tagline", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Summary</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  placeholder="Brief description of this program"
                  value={newForm.summary ?? ""}
                  onChange={(e) => setNewField("summary", e.target.value)}
                />
              </div>
            </div>

            {/* Media */}
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUpload
                label="Program Image"
                value={newForm.image_url ?? ""}
                onChange={(url) => setNewField("image_url", url)}
                accept="image/*"
                hint="Main photo shown on the program page."
              />
              <div className="space-y-2">
                <label className="mb-1.5 block text-xs font-semibold text-[var(--brand-navy)]">Video URL</label>
                <input
                  className="input"
                  value={newForm.video_url ?? ""}
                  onChange={(e) => setNewField("video_url", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-[11px] text-muted-foreground">Paste a YouTube or Vimeo link.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--brand-navy)]">Impact Stats</span>
                <button type="button" onClick={addNewStat} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-blue)]">
                  <Plus className="h-3.5 w-3.5" /> Add Stat
                </button>
              </div>
              <div className="space-y-3">
                {(newForm.stats ?? []).map((s, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Number</label>
                        <input className="input" placeholder="e.g. 82" value={s.n} onChange={(e) => updateNewStat(i, "n", e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Label</label>
                        <input className="input" placeholder="e.g. Schools Built" value={s.l} onChange={(e) => updateNewStat(i, "l", e.target.value)} />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeNewStat(i)} className="mt-6 grid h-8 w-8 flex-shrink-0 place-items-center rounded border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {newForm.stats.length === 0 && <p className="text-xs text-muted-foreground">No stats yet. Click "Add Stat" to add one.</p>}
              </div>
            </div>

            {/* Highlights */}
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--brand-navy)]">Highlights</span>
                <button type="button" onClick={addNewHighlight} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-blue)]">
                  <Plus className="h-3.5 w-3.5" /> Add Highlight
                </button>
              </div>
              <div className="space-y-3">
                {(newForm.highlights ?? []).map((h, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1 grid gap-3 sm:grid-cols-[1fr_2fr]">
                      <div>
                        <label className="label">Heading</label>
                        <input className="input" placeholder="e.g. Wells Drilled" value={h.title} onChange={(e) => updateNewHighlight(i, "title", e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Description</label>
                        <input className="input" value={h.text} onChange={(e) => updateNewHighlight(i, "text", e.target.value)} />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeNewHighlight(i)} className="mt-6 grid h-8 w-8 flex-shrink-0 place-items-center rounded border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {newForm.highlights.length === 0 && <p className="text-xs text-muted-foreground">No highlights yet. Click "Add Highlight" to add one.</p>}
              </div>
            </div>

            {newError && <p className="text-xs text-red-600">{newError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creatingNew}
                className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-60"
              >
                {creatingNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creatingNew ? "Creating…" : "Create Program"}
              </button>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-slate-50 transition"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {programs.length === 0 && !showNew ? (
        <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">
          No programs yet. Click "New Program" to add one.
        </div>
      ) : (
        <>
          {/* Tab pills */}
          <div className="mb-6 flex flex-wrap gap-2">
            {programs.map((p) => (
              <div key={p.slug} className="flex items-center gap-1">
                <button
                  onClick={() => setActive(p.slug)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    active === p.slug
                      ? "bg-[var(--brand-navy)] text-white"
                      : "border border-border bg-white text-muted-foreground hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)]"
                  }`}
                >
                  {p.title}
                </button>
                <button
                  onClick={() => handleDelete(p.slug)}
                  disabled={deletingSlug === p.slug}
                  title={`Delete ${p.title}`}
                  className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border border-border bg-white text-muted-foreground hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
                >
                  {deletingSlug === p.slug
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Trash2 className="h-3 w-3" />}
                </button>
              </div>
            ))}
          </div>

          {programs.map((p) => {
            const f = forms[p.slug];
            if (!f || active !== p.slug) return null;
            return (
              <div key={p.slug} className="space-y-6">
                {/* Basic fields */}
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <h2 className="mb-4 font-semibold text-[var(--brand-navy)] capitalize">{p.title} — Basic Info</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Title</label>
                      <input className="input" value={f.title} onChange={(e) => setField(p.slug, "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Tagline</label>
                      <input className="input" value={f.tagline ?? ""} onChange={(e) => setField(p.slug, "tagline", e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Summary</label>
                      <textarea className="input min-h-[100px] resize-y" value={f.summary ?? ""} onChange={(e) => setField(p.slug, "summary", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Program Media */}
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <h2 className="mb-5 font-semibold text-[var(--brand-navy)]">Program Media</h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <ImageUpload
                      label="Program Image"
                      value={f.image_url ?? ""}
                      onChange={(url) => setField(p.slug, "image_url", url)}
                      accept="image/*"
                      hint="Main photo shown on the program detail page."
                    />
                    <div className="space-y-2">
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--brand-navy)]">Program Video URL</label>
                      <input
                        className="input"
                        value={f.video_url ?? ""}
                        onChange={(e) => setField(p.slug, "video_url", e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                      {f.video_url && (
                        <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
                          <iframe
                            src={f.video_url.replace("watch?v=", "embed/")}
                            className="h-full w-full"
                            allowFullScreen
                          />
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground">Paste a YouTube or Vimeo link.</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-[var(--brand-navy)]">Impact Stats</h2>
                    <button onClick={() => addStat(p.slug)} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-blue)]">
                      <Plus className="h-3.5 w-3.5" /> Add Stat
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(f.stats ?? []).map((s, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="label">Number</label>
                            <input className="input" placeholder="e.g. 82" value={s.n} onChange={(e) => updateStat(p.slug, i, "n", e.target.value)} />
                          </div>
                          <div>
                            <label className="label">Label</label>
                            <input className="input" placeholder="e.g. Schools Built" value={s.l} onChange={(e) => updateStat(p.slug, i, "l", e.target.value)} />
                          </div>
                        </div>
                        <button onClick={() => removeStat(p.slug, i)} className="mt-6 grid h-8 w-8 flex-shrink-0 place-items-center rounded border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {(f.stats ?? []).length === 0 && <p className="text-xs text-muted-foreground">No stats yet.</p>}
                  </div>
                </div>

                {/* Highlights */}
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-[var(--brand-navy)]">Highlights</h2>
                    <button onClick={() => addHighlight(p.slug)} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-blue)]">
                      <Plus className="h-3.5 w-3.5" /> Add Highlight
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(f.highlights ?? []).map((h, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="flex-1 grid gap-3 sm:grid-cols-[1fr_2fr]">
                          <div>
                            <label className="label">Heading</label>
                            <input className="input" placeholder="e.g. Classrooms Built" value={h.title} onChange={(e) => updateHighlight(p.slug, i, "title", e.target.value)} />
                          </div>
                          <div>
                            <label className="label">Description</label>
                            <input className="input" value={h.text} onChange={(e) => updateHighlight(p.slug, i, "text", e.target.value)} />
                          </div>
                        </div>
                        <button onClick={() => removeHighlight(p.slug, i)} className="mt-6 grid h-8 w-8 flex-shrink-0 place-items-center rounded border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {(f.highlights ?? []).length === 0 && <p className="text-xs text-muted-foreground">No highlights yet.</p>}
                  </div>
                </div>

                {/* Save */}
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  onClick={() => handleSave(p.slug)}
                  disabled={!!saving}
                  className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-6 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-60"
                >
                  {saving === p.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving === p.slug ? "Saving…" : saved === p.slug ? "Saved ✓" : "Save Changes"}
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
