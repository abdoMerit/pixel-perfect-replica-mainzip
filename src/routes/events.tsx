import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MapPin, Clock } from "lucide-react";
import { SiteLayout, PageHero, SectionEyebrow } from "@/components/site-layout";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — HopeRise" },
      { name: "description", content: "Join HopeRise events, fundraisers, and community gatherings around the world." },
      { property: "og:title", content: "Events — HopeRise" },
      { property: "og:description", content: "Upcoming events, fundraisers, and community gatherings." },
    ],
  }),
  component: EventsPage,
});

const EVENTS = [
  { day: "12", mon: "JUN", date: "Jun 12, 2024", time: "6:00 PM", loc: "Nairobi, Kenya", title: "Annual Charity Gala 2024", text: "An evening of stories, music, and giving in support of our education programs." },
  { day: "05", mon: "JUL", date: "Jul 05, 2024", time: "9:00 AM", loc: "Mogadishu, Somalia", title: "Community Health Fair", text: "Free screenings, vaccinations, and healthy-living workshops for local families." },
  { day: "20", mon: "AUG", date: "Aug 20, 2024", time: "10:00 AM", loc: "Addis Ababa, Ethiopia", title: "Reforestation Volunteer Day", text: "Help us plant 10,000 trees in a single day — bring friends and family." },
  { day: "14", mon: "SEP", date: "Sep 14, 2024", time: "2:00 PM", loc: "Online (Zoom)", title: "Impact Report Webinar", text: "Meet our teams and hear directly from communities about the year's progress." },
];

function EventsPage() {
  return (
    <SiteLayout>
      <PageHero title="Events" breadcrumb="Events" />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionEyebrow label="Upcoming Events" />
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold text-[var(--brand-navy)]">Join Us In Person or Online</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {EVENTS.map((e, i) => (
              <div key={i} className="flex gap-5 rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-lg bg-[var(--brand-green)] text-white">
                  <div className="text-center">
                    <div className="text-lg font-bold leading-none">{e.day}</div>
                    <div className="text-[10px] uppercase mt-1">{e.mon}</div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--brand-navy)]">{e.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{e.text}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[var(--brand-green-dark)]" /> {e.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[var(--brand-green-dark)]" /> {e.loc}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-[var(--brand-green-dark)]" /> {e.date}</span>
                  </div>
                  <Link to="/contact" className="mt-4 inline-block text-xs font-semibold text-[var(--brand-blue)]">Register →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}