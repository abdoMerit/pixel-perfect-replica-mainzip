import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { ImageUpload } from "@/components/image-upload";
import { getPublicPrograms, adminUpdateProgram, type ProgramData } from "@/lib/content-fn";

export const Route = createFileRoute("/admin/programs")({
  head: () => ({ meta: [{ title: "Programs — UFF Admin" }] }),
  component: ProgramsAdminPage,
});

function ProgramsAdminPage() {
  const { token } = useAdmin();
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, ProgramData>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicPrograms()
      .then((r) => {
        setPrograms(r.programs);
        const f: Record<string, ProgramData> = {};
        for (const p of r.programs) f[p.slug] = { ...p };
        setForms(f);
        if (r.programs.length > 0) setActive(r.programs[0].slug);
      })
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-white border border-border" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Programs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit content, images, stats and highlights for each program.</p>
      </div>

      {/* Tab pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {programs.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActive(p.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              active === p.slug
                ? "bg-[var(--brand-navy)] text-white"
                : "border border-border bg-white text-muted-foreground hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)]"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {programs.map((p) => {
        const f = forms[p.slug];
        if (!f || active !== p.slug) return null;
        return (
          <div key={p.slug} className="space-y-6">
            {/* Basic fields */}
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-[var(--brand-navy)] capitalize">{p.slug} — Basic Info</h2>
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
    </div>
  );
}
