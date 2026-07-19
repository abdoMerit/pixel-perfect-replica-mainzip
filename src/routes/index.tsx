import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Heart, ArrowRight, Play, Users, Globe, UserRound,
  Target, Eye, Shield, Compass, Stethoscope,
  Leaf, Sprout, BookOpen, Calendar, Briefcase, MapPin, ChevronLeft,
  ChevronRight, Quote, Building2,
} from "lucide-react";
import { SiteLayout, SectionEyebrow } from "@/components/site-layout";
import { getPublicHeroSlides, getPublicTestimonials, getPublicPartners, type HeroSlide, type Testimonial, type Partner } from "@/lib/content-fn";
import heroImg from "@/assets/hero.jpg";
import progEdu from "@/assets/prog-education.jpg";
import progHealth from "@/assets/prog-health.jpg";
import progEnv from "@/assets/prog-environment.jpg";
import progLive from "@/assets/prog-livelihood.jpg";
import projSchool from "@/assets/proj-school.jpg";
import projHealthImg from "@/assets/proj-health.jpg";
import projWater from "@/assets/proj-water.jpg";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const FALLBACK: HeroSlide = {
  id: 0,
  image_url: "",
  headline: "Building a Better Future for All",
  subtext: "We work in partnership with local communities to create sustainable solutions that change lives and build a better tomorrow.",
  badge_text: "Together We Can",
  cta_label: "Our Programs",
  cta_to: "/programs",
  sort_order: 0,
  active: true,
};

function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    getPublicHeroSlides().then((r) => {
      if (r.slides.length > 0) setSlides(r.slides);
    });
  }, []);

  const advance = useCallback(() => setCurrent((c) => (c + 1) % Math.max(slides.length, 1)), [slides.length]);
  const back    = useCallback(() => setCurrent((c) => (c - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1)), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(advance, 5500);
    return () => clearInterval(t);
  }, [slides.length, paused, advance]);

  const slide   = slides[current] ?? FALLBACK;
  const imgSrc  = slide.image_url || heroImg;
  const total   = slides.length;

  return (
    <section className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[620px] w-full overflow-hidden">
        {/* Slide images — fade transition */}
        {slides.length > 0 ? (
          slides.map((s, i) => (
            <img
              key={s.id}
              src={s.image_url || heroImg}
              alt={s.headline}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
            />
          ))
        ) : (
          <img src={heroImg} alt="Smiling children" className="absolute inset-0 h-full w-full object-cover" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
          <div className="max-w-xl text-white">
            {slide.badge_text && (
              <span className="inline-block rounded bg-[var(--brand-green)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white">
                {slide.badge_text}
              </span>
            )}
            <h1 className="mt-5 font-display text-5xl md:text-6xl font-extrabold leading-[1.05]">
              {slide.headline || FALLBACK.headline}
            </h1>
            <p className="mt-5 max-w-md text-base text-white/85">
              {slide.subtext || FALLBACK.subtext}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={(slide.cta_to || "/programs") as "/programs"}
                className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-110 transition"
              >
                {slide.cta_label || "Our Programs"} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-navy)] shadow-md hover:bg-[var(--brand-bg-soft)] transition">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand-navy)]"><Play className="h-3 w-3 fill-white text-white" /></span>
                Watch Video
              </a>
            </div>
          </div>
        </div>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={back}
              className="absolute left-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={advance}
              className="absolute right-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats overlay */}
      <div className="relative -mt-14 px-4">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 rounded-md bg-[var(--brand-navy)] text-white shadow-xl">
          {[
            { icon: Users, n: "15+", l: "Projects Completed", c: "text-cyan-300" },
            { icon: Globe, n: "2+", l: "Countries Served", c: "text-[var(--brand-green)]" },
            { icon: UserRound, n: "1,000+", l: "People Impacted", c: "text-[var(--brand-orange)]" },
            { icon: Users, n: "10+", l: "Partners Worldwide", c: "text-[var(--brand-purple)]" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 border-white/10 px-6 py-6 md:border-r last:md:border-r-0">
              <s.icon className={`h-9 w-9 ${s.c}`} strokeWidth={1.75} />
              <div>
                <div className="text-2xl font-bold">{s.n}</div>
                <div className="text-xs text-white/70">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const cards = [
    { icon: Target, color: "var(--brand-blue)", title: "Our Mission", text: "To empower communities and create sustainable solutions for a better tomorrow." },
    { icon: Eye, color: "var(--brand-green-dark)", title: "Our Vision", text: "A world where every individual has the opportunity to live a dignified and fulfilling life." },
    { icon: Shield, color: "var(--brand-orange)", title: "Our Values", text: "Integrity, Transparency, Compassion, Collaboration, and Accountability." },
    { icon: Compass, color: "var(--brand-purple)", title: "Our Goals", text: "To reduce poverty, promote education, improve health, and protect our planet." },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 lg:grid-cols-2">
        <div>
          <SectionEyebrow label="About Us" />
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight text-[var(--brand-navy)]">
            We Are A Non-Profit Organization<br />
            Working <span className="text-[var(--brand-green-dark)]">Worldwide</span>
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Unique Future Foundation (UFF) is a non-profit, non-governmental organization working in partnership with communities and stakeholders to improve lives through sustainable programs in education, health, environment, and economic empowerment.
          </p>
          <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded bg-[var(--brand-blue)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition">
            Learn More About Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.title} className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
              <div className="grid h-11 w-11 place-items-center rounded-full" style={{ backgroundColor: c.color }}>
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-[var(--brand-navy)]">{c.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Impact() {
  const stats = [
    { icon: Users, n: "1,000+", l: "People Impacted", c: "var(--brand-blue)" },
    { icon: Globe, n: "2+", l: "Countries Served", c: "var(--brand-green-dark)" },
    { icon: Heart, n: "15+", l: "Projects Completed", c: "var(--brand-orange)" },
    { icon: UserRound, n: "10+", l: "Partners & Supporters", c: "var(--brand-purple)" },
    { icon: Calendar, n: "5+", l: "Years of Experience", c: "var(--brand-green-dark)" },
    { icon: Briefcase, n: "20+", l: "Dedicated Staff", c: "var(--brand-blue)" },
  ];
  return (
    <section className="bg-[var(--brand-bg-soft)] py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <div className="flex justify-center"><SectionEyebrow label="Our Impact" /></div>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-[var(--brand-navy)]">
            We Create Real <span className="text-[var(--brand-green-dark)]">Impact</span>
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <s.icon className="mx-auto h-10 w-10" style={{ color: s.c }} strokeWidth={1.75} />
              <div className="mt-3 text-2xl font-bold text-[var(--brand-navy)]">{s.n}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Programs() {
  const items = [
    { slug: "education", img: progEdu, icon: BookOpen, title: "Education", text: "We promote quality education and lifelong learning opportunities for all children." },
    { slug: "health", img: progHealth, icon: Stethoscope, title: "Health", text: "We improve access to quality healthcare and promote healthy communities." },
    { slug: "environment", img: progEnv, icon: Leaf, title: "Environment", text: "We protect the environment and promote sustainable practices for future generations." },
    { slug: "livelihood", img: progLive, icon: Sprout, title: "Livelihood", text: "We empower communities with skills and resources for sustainable livelihoods." },
  ];
  return (
    <section id="programs" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionEyebrow label="Our Programs" />
        <h2 className="mt-3 font-display text-4xl font-extrabold text-[var(--brand-navy)]">Programs That Create Change</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.title} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-lg">
              <div className="relative">
                <img src={p.img} alt={p.title} className="h-52 w-full object-cover" loading="lazy" width={800} height={600} />
                <div className="absolute -bottom-6 left-5 grid h-12 w-12 place-items-center rounded-full bg-[var(--brand-green)] shadow-md">
                  <p.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="p-6 pt-9">
                <h3 className="font-semibold text-[var(--brand-navy)]">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.text}</p>
                <Link to="/programs/$slug" params={{ slug: p.slug }} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-blue)] hover:gap-2 transition-all">
                  Read More <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link to="/programs" className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition">
            View All Programs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectsAndNews() {
  const projects = [
    { img: projSchool, tag: "Education", tagColor: "var(--brand-green-dark)", title: "Building Schools for Better Future", loc: "Mogadishu, Somalia" },
    { img: projHealthImg, tag: "Health", tagColor: "var(--brand-orange)", title: "Community Health Care Program", loc: "Garowe, Somalia" },
    { img: projWater, tag: "Environment", tagColor: "var(--brand-orange)", title: "Clean Water Initiative Project", loc: "Kismayo, Somalia" },
  ];
  const news = [
    { img: news1, title: "UFF Launches New Education Program for Girls", date: "May 20, 2024" },
    { img: news2, title: "Clean Water Initiative Reaches 10,000 Communities", date: "May 15, 2024" },
    { img: news3, title: "Annual Report 2023: A Year of Significant Impact", date: "May 10, 2024" },
  ];
  return (
    <section className="pb-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <SectionEyebrow label="Recent Projects" />
              <h2 className="mt-3 font-display text-3xl font-extrabold text-[var(--brand-navy)]">Our Latest Projects</h2>
            </div>
            <div className="flex gap-2">
              <button className="grid h-9 w-9 place-items-center rounded border border-border text-[var(--brand-navy)] hover:border-[var(--brand-green)]"><ChevronLeft className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded border border-border text-[var(--brand-navy)] hover:border-[var(--brand-green)]"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {projects.map((p) => (
              <div key={p.title} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="relative">
                  <img src={p.img} alt={p.title} className="h-40 w-full object-cover" loading="lazy" width={600} height={600} />
                  <span className="absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-semibold uppercase text-white" style={{ backgroundColor: p.tagColor }}>{p.tag}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[var(--brand-navy)]">{p.title}</h3>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> {p.loc}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/projects" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-blue)]">
            <MapPin className="h-3.5 w-3.5" /> View All Projects
          </Link>
        </div>

        <div>
          <div className="flex items-start justify-between">
            <div>
              <SectionEyebrow label="Latest News" />
              <h2 className="mt-3 font-display text-3xl font-extrabold text-[var(--brand-navy)]">News &amp; Updates</h2>
            </div>
            <div className="flex gap-2">
              <button className="grid h-9 w-9 place-items-center rounded border border-border text-[var(--brand-navy)]"><ChevronLeft className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded border border-border text-[var(--brand-navy)]"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {news.map((n) => (
              <div key={n.title} className="flex gap-4">
                <img src={n.img} alt={n.title} className="h-16 w-20 flex-shrink-0 rounded object-cover" loading="lazy" width={512} height={512} />
                <div>
                  <h3 className="text-sm font-semibold leading-snug text-[var(--brand-navy)]">{n.title}</h3>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Calendar className="h-3 w-3" /> {n.date}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/news" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-blue)]">
            View All News <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Default seed data shown before any DB entries exist ──────────────────────

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 1, name: "Amina Hassan", role: "Community Leader, Mogadishu", quote: "UFF changed everything for our village. Our children now have a safe school to attend and clean water to drink. The foundation doesn't just give — they stay and build with us.", avatar_url: "", sort_order: 1, active: true },
  { id: 2, name: "Dr. Khalid Osman", role: "Health Partner, Garowe", quote: "Working alongside UFF's health teams showed me what real community medicine looks like. They train local nurses, not just fly in and fly out. That's how change lasts.", avatar_url: "", sort_order: 2, active: true },
  { id: 3, name: "Fatuma Abdi", role: "Scholarship Recipient", quote: "I was the first girl in my family to finish secondary school. UFF's scholarship didn't just pay fees — they gave me a mentor who believed in me before I believed in myself.", avatar_url: "", sort_order: 3, active: true },
  { id: 4, name: "Ibrahim Warsame", role: "Smallholder Farmer, Baidoa", quote: "The drought-resistant seeds and training changed our harvest completely. For the first time in years, we sold surplus at market. UFF understands farmers.", avatar_url: "", sort_order: 4, active: true },
  { id: 5, name: "Nadia Jama", role: "Volunteer Coordinator", quote: "I've volunteered with many NGOs but UFF is different. Every decision goes through the community first. That respect is rare and it makes the impact real.", avatar_url: "", sort_order: 5, active: true },
  { id: 6, name: "Ahmed Nur", role: "Youth Program Graduate", quote: "The vocational training gave me the skills, but the mentorship gave me the confidence. I now run my own carpentry workshop and employ three other young men.", avatar_url: "", sort_order: 6, active: true },
];

const DEFAULT_PARTNERS: Partner[] = [
  { id: 1, name: "UNICEF",        logo_url: "", website_url: "https://unicef.org",     sort_order: 1, active: true },
  { id: 2, name: "UNHCR",         logo_url: "", website_url: "https://unhcr.org",      sort_order: 2, active: true },
  { id: 3, name: "WHO",           logo_url: "", website_url: "https://who.int",        sort_order: 3, active: true },
  { id: 4, name: "WFP",           logo_url: "", website_url: "https://wfp.org",        sort_order: 4, active: true },
  { id: 5, name: "USAID",         logo_url: "", website_url: "https://usaid.gov",      sort_order: 5, active: true },
  { id: 6, name: "EU Aid",        logo_url: "", website_url: "https://europa.eu",      sort_order: 6, active: true },
  { id: 7, name: "Save the Children", logo_url: "", website_url: "https://savethechildren.org", sort_order: 7, active: true },
  { id: 8, name: "IRC",           logo_url: "", website_url: "https://rescue.org",     sort_order: 8, active: true },
  { id: 9, name: "Oxfam",         logo_url: "", website_url: "https://oxfam.org",      sort_order: 9, active: true },
  { id: 10, name: "Care International", logo_url: "", website_url: "https://care.org", sort_order: 10, active: true },
];

// ── Testimonials ──────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-[var(--brand-green)]", "bg-[var(--brand-blue)]", "bg-[var(--brand-navy)]",
  "bg-emerald-600", "bg-teal-600", "bg-sky-600",
];

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    getPublicTestimonials()
      .then((r) => setTestimonials(r.testimonials.length > 0 ? r.testimonials : DEFAULT_TESTIMONIALS))
      .catch(() => setTestimonials(DEFAULT_TESTIMONIALS));
  }, []);

  const items = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  // Duplicate for seamless infinite loop
  const row1 = [...items, ...items];
  const row2 = [...items.slice().reverse(), ...items.slice().reverse()];

  return (
    <section className="py-20 bg-[var(--brand-navy-deep)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 mb-12 text-center">
        <SectionEyebrow label="Testimonials" />
        <h2 className="mt-3 font-display text-3xl font-extrabold text-white">
          Voices From the Field
        </h2>
        <p className="mt-3 text-sm text-white/60 max-w-xl mx-auto">
          Real stories from the communities, partners, and individuals whose lives have been touched by UFF's work.
        </p>
      </div>

      {/* Single row — scrolls left */}
      <div className="relative">
        <div className="flex gap-4 w-max animate-marquee">
          {row1.map((t, i) => (
            <TestimonialCard key={`r1-${i}`} t={t} idx={i} />
          ))}
        </div>
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--brand-navy-deep)] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--brand-navy-deep)] to-transparent z-10" />
      </div>
    </section>
  );
}

function TestimonialCard({ t, idx }: { t: Testimonial; idx: number }) {
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div className="w-72 shrink-0 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-[var(--brand-green)]/40 hover:bg-white/10 transition">
      <Quote className="h-5 w-5 text-[var(--brand-green)] mb-3 opacity-80" />
      <p className="text-xs leading-relaxed text-white/80 line-clamp-4">{t.quote}</p>
      <div className="mt-4 flex items-center gap-3">
        {t.avatar_url ? (
          <img src={t.avatar_url} alt={t.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-[var(--brand-green)]/40" />
        ) : (
          <div className={`h-9 w-9 rounded-full ${color} grid place-items-center text-xs font-bold text-white ring-2 ring-white/20`}>
            {getInitials(t.name)}
          </div>
        )}
        <div>
          <div className="text-xs font-semibold text-white">{t.name}</div>
          <div className="text-[10px] text-white/50">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

// ── Partners ──────────────────────────────────────────────────────────────────

function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    getPublicPartners()
      .then((r) => setPartners(r.partners.length > 0 ? r.partners : DEFAULT_PARTNERS))
      .catch(() => setPartners(DEFAULT_PARTNERS));
  }, []);

  const items = partners.length > 0 ? partners : DEFAULT_PARTNERS;
  const row = [...items, ...items]; // duplicate for seamless loop

  return (
    <section className="py-16 bg-slate-50 overflow-hidden border-y border-border">
      <div className="mx-auto max-w-7xl px-4 mb-10 text-center">
        <SectionEyebrow label="Our Partners" />
        <h2 className="mt-3 font-display text-2xl font-extrabold text-[var(--brand-navy)]">
          Trusted By Leading Organizations
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We work with global partners who share our commitment to sustainable community development.
        </p>
      </div>

      <div className="relative">
        <div className="flex gap-6 w-max animate-marquee">
          {row.map((p, i) => (
            <PartnerCard key={`p-${i}`} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerCard({ p }: { p: Partner }) {
  const inner = (
    <div className="w-44 h-20 shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-white shadow-sm px-4 hover:border-[var(--brand-green)] hover:shadow-md transition group">
      {p.logo_url ? (
        <img src={p.logo_url} alt={p.name} className="h-10 max-w-[120px] object-contain grayscale group-hover:grayscale-0 transition" />
      ) : (
        <>
          <Building2 className="h-6 w-6 text-muted-foreground group-hover:text-[var(--brand-green)] transition" />
          <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-[var(--brand-navy)] transition text-center leading-tight">{p.name}</span>
        </>
      )}
    </div>
  );

  if (p.website_url) {
    return <a href={p.website_url} target="_blank" rel="noreferrer">{inner}</a>;
  }
  return inner;
}

function CTA() {
  return (
    <section className="pb-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg bg-[var(--brand-navy)] px-8 py-6 text-white shadow-lg">
          <div className="flex items-center gap-5">
            <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-[var(--brand-green)]">
              <Heart className="h-6 w-6 text-[var(--brand-green)]" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">Join Us And Make A Difference</h3>
              <p className="text-xs text-white/70">Your support can help us empower more communities and change more lives.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/volunteer" className="inline-flex items-center gap-2 rounded border-2 border-[var(--brand-green)] px-5 py-3 text-sm font-semibold hover:bg-[var(--brand-green)] transition">
              Volunteer With Us <Users className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <About />
      <Impact />
      <Programs />
      <ProjectsAndNews />
      <TestimonialsSection />
      <PartnersSection />
      <CTA />
    </SiteLayout>
  );
}
