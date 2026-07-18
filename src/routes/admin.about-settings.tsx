import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { getPublicSettings, adminUpdateSettings, type SiteSettings } from "@/lib/content-fn";

export const Route = createFileRoute("/admin/about-settings")({
  head: () => ({ meta: [{ title: "About Settings — UFF Admin" }] }),
  component: AboutSettingsPage,
});

function AboutSettingsPage() {
  const { password } = useAdmin();
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicSettings().then((r) => setSettings(r.settings)).finally(() => setLoading(false));
  }, []);

  function set(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminUpdateSettings({ data: { password, settings } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-white border border-border" />)}</div>;
  }

  const s = settings;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">About Page Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit the organisation description, mission, vision, values, and goals.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Who we are */}
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--brand-navy)]">Who We Are</h2>
          <div className="grid gap-4">
            <div>
              <label className="label">Main Description</label>
              <textarea className="input min-h-[100px] resize-y" value={s.about_description ?? ""} onChange={(e) => set("about_description", e.target.value)} />
            </div>
            <div>
              <label className="label">Founded / History Paragraph</label>
              <textarea className="input min-h-[80px] resize-y" value={s.about_founded ?? ""} onChange={(e) => set("about_founded", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Mission / Vision / Values / Goals */}
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--brand-navy)]">Mission, Vision, Values &amp; Goals</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Mission</label>
              <textarea className="input min-h-[80px] resize-y" value={s.mission_text ?? ""} onChange={(e) => set("mission_text", e.target.value)} />
            </div>
            <div>
              <label className="label">Vision</label>
              <textarea className="input min-h-[80px] resize-y" value={s.vision_text ?? ""} onChange={(e) => set("vision_text", e.target.value)} />
            </div>
            <div>
              <label className="label">Values</label>
              <textarea className="input min-h-[80px] resize-y" value={s.values_text ?? ""} onChange={(e) => set("values_text", e.target.value)} />
            </div>
            <div>
              <label className="label">Goals</label>
              <textarea className="input min-h-[80px] resize-y" value={s.goals_text ?? ""} onChange={(e) => set("goals_text", e.target.value)} />
            </div>
          </div>
        </section>

        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded bg-[var(--brand-navy)] px-6 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
