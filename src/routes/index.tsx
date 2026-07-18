import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart, ArrowRight, Play, Users, Globe, UserRound,
  Target, Eye, Shield, Compass, Stethoscope,
  Leaf, Sprout, BookOpen, Calendar, Briefcase, MapPin, ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SiteLayout, SectionEyebrow } from "@/components/site-layout";
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

function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[620px] w-full overflow-hidden">
        <img src={heroImg} alt="Smiling children" className="absolute inset-0 h-full w-full object-cover" width={1600} height={900} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
          <div className="max-w-xl text-white">
            <span className="inline-block rounded bg-[var(--brand-green)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white">Together We Can</span>
            <h1 className="mt-5 font-display text-5xl md:text-6xl font-extrabold leading-[1.05]">
              Building a Better<br />Future for All
            </h1>
            <p className="mt-5 max-w-md text-base text-white/85">
              We work in partnership with local communities to create sustainable solutions that change lives and build a better tomorrow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/programs" className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-110 transition">
                Our Programs <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-navy)] shadow-md hover:bg-[var(--brand-bg-soft)] transition">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand-navy)]"><Play className="h-3 w-3 fill-white text-white" /></span>
                Watch Video
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* stats overlay */}
      <div className="relative -mt-14 px-4">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 rounded-md bg-[var(--brand-navy)] text-white shadow-xl">
          {[
            { icon: Users, n: "120+", l: "Projects Completed", c: "text-cyan-300" },
            { icon: Globe, n: "25+", l: "Countries Served", c: "text-[var(--brand-green)]" },
            { icon: UserRound, n: "1.2M+", l: "People Impacted", c: "text-[var(--brand-orange)]" },
            { icon: Users, n: "300+", l: "Partners Worldwide", c: "text-[var(--brand-purple)]" },
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
            HopeRise Organization is a non-profit, non-governmental organization working in partnership with communities and stakeholders to improve lives through sustainable programs in education, health, environment, and economic empowerment.
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
    { icon: Users, n: "1.2M+", l: "People Impacted", c: "var(--brand-blue)" },
    { icon: Globe, n: "25+", l: "Countries Served", c: "var(--brand-green-dark)" },
    { icon: Heart, n: "120+", l: "Projects Completed", c: "var(--brand-orange)" },
    { icon: UserRound, n: "300+", l: "Partners & Supporters", c: "var(--brand-purple)" },
    { icon: Calendar, n: "15+", l: "Years of Experience", c: "var(--brand-green-dark)" },
    { icon: Briefcase, n: "250+", l: "Dedicated Staff", c: "var(--brand-blue)" },
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
    { img: news1, title: "HopeRise Launches New Education Program for Girls", date: "May 20, 2024" },
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
            <Link to="/donate" className="inline-flex items-center gap-2 rounded bg-[var(--brand-green)] px-5 py-3 text-sm font-semibold shadow hover:brightness-110 transition">
              Donate Now <Heart className="h-4 w-4 fill-white" />
            </Link>
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
      <CTA />
    </SiteLayout>
  );
}
