import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { getPublicSettings, adminUpdateSettings, type SiteSettings } from "@/lib/content-fn";

export const Route = createFileRoute("/admin/home-settings")({
  head: () => ({ meta: [{ title: "Home Settings — UFF Admin" }] }),
  component: HomeSettingsPage,
});

function HomeSettingsPage() {
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
    return <div className="space-y-4">{[1,2,3,4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-white border border-border" />)}</div>;
  }

  const s = settings;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Home Page Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit the hero, stats, and impact section on the homepage.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero */}
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--brand-navy)]">Hero Section</h2>
          <div className="grid gap-4">
            <div>
              <label className="label">Badge Text</label>
              <input className="input" value={s.hero_badge ?? ""} onChange={(e) => set("hero_badge", e.target.value)} />
            </div>
            <div>
              <label className="label">Headline</label>
              <input className="input" value={s.hero_headline ?? ""} onChange={(e) => set("hero_headline", e.target.value)} />
            </div>
            <div>
              <label className="label">Subtext</label>
              <textarea className="input min-h-[80px] resize-y" value={s.hero_subtext ?? ""} onChange={(e) => set("hero_subtext", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Hero Stats Bar */}
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--brand-navy)]">Stats Bar (below hero)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1,2,3,4].map((n) => (
              <div key={n} className="flex gap-3">
                <div className="flex-1">
                  <label className="label">Stat {n} Number</label>
                  <input className="input" value={s[`stat_${n}_n`] ?? ""} onChange={(e) => set(`stat_${n}_n`, e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="label">Stat {n} Label</label>
                  <input className="input" value={s[`stat_${n}_l`] ?? ""} onChange={(e) => set(`stat_${n}_l`, e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Impact Stats */}
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--brand-navy)]">Impact Section Stats (6 items)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className="flex gap-3">
                <div className="flex-1">
                  <label className="label">Impact {n} Number</label>
                  <input className="input" value={s[`impact_stat_${n}_n`] ?? ""} onChange={(e) => set(`impact_stat_${n}_n`, e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="label">Impact {n} Label</label>
                  <input className="input" value={s[`impact_stat_${n}_l`] ?? ""} onChange={(e) => set(`impact_stat_${n}_l`, e.target.value)} />
                </div>
              </div>
            ))}
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
