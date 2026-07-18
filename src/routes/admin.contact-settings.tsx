import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Youtube, Globe } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { getPublicSettings, adminUpdateSettings } from "@/lib/content-fn";

export const Route = createFileRoute("/admin/contact-settings")({
  head: () => ({ meta: [{ title: "Contact & Info — UFF Admin" }] }),
  component: ContactSettingsPage,
});

const FIELDS = [
  {
    section: "Contact Information",
    fields: [
      { key: "contact_phone",   label: "Phone Number",  placeholder: "+252 90 730 3587",               icon: Phone },
      { key: "contact_email",   label: "Email Address", placeholder: "info@uniquefuturefoundation.org", icon: Mail },
      { key: "contact_address", label: "Address / Location", placeholder: "Mogadishu, Somalia",        icon: MapPin },
      { key: "contact_hours",   label: "Office Hours",  placeholder: "Mon - Fri: 8:00AM - 5:00PM",     icon: Clock },
    ],
  },
  {
    section: "Social Media Links",
    fields: [
      { key: "social_facebook",  label: "Facebook URL",  placeholder: "https://facebook.com/uff",  icon: Facebook },
      { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/uff", icon: Instagram },
      { key: "social_twitter",   label: "Twitter / X URL", placeholder: "https://twitter.com/uff", icon: Twitter },
      { key: "social_youtube",   label: "YouTube URL",   placeholder: "https://youtube.com/@uff",  icon: Youtube },
    ],
  },
  {
    section: "Google Maps Embed",
    fields: [
      { key: "contact_map_embed", label: "Google Maps Embed URL", placeholder: "Paste the 'src' URL from Google Maps → Share → Embed a map", icon: Globe },
    ],
  },
];

function ContactSettingsPage() {
  const { token } = useAdmin();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicSettings()
      .then((r) => setSettings(r))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      await adminUpdateSettings({ data: { token, settings } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/20";

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
        <h1 className="font-display text-2xl font-extrabold text-[var(--brand-navy)]">Contact & Info</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your phone number, email, address, office hours, and social media links. These appear throughout the website.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {FIELDS.map((group) => (
          <div key={group.section} className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-semibold text-[var(--brand-navy)]">{group.section}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.fields.map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key} className={key === "contact_map_embed" ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-navy)]">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {label}
                  </label>
                  <input
                    className={inputCls}
                    value={settings[key] ?? ""}
                    onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            {/* Map preview */}
            {group.section === "Google Maps Embed" && settings.contact_map_embed && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">Preview:</p>
                <iframe
                  src={settings.contact_map_embed}
                  className="h-48 w-full rounded-lg border border-border"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        ))}

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
