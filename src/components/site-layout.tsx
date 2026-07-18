import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Mail, Phone, Clock, Facebook, Twitter, Linkedin, Instagram, Youtube,
  Search, Heart, ChevronDown, ArrowRight, Globe, HandHeart, MapPin, ArrowUp,
} from "lucide-react";

export const NAV: { label: string; to: string }[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Programs", to: "/programs" },
  { label: "Projects", to: "/projects" },
  { label: "News", to: "/news" },
  { label: "Events", to: "/events" },
  { label: "Contact", to: "/contact" },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src="/uff-icon.png" alt="UFF Logo" className="h-10 w-10 rounded-full object-cover" />
      <div className="leading-tight">
        <div className={`font-display text-xl font-extrabold ${light ? "text-white" : "text-[var(--brand-navy)]"}`}>Unique Future Foundation</div>
        <div className={`text-[10px] uppercase tracking-widest ${light ? "text-white/70" : "text-muted-foreground"}`}>UFF</div>
      </div>
    </Link>
  );
}

export function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-green-dark)]">
      <span className="h-2 w-2 rounded-full bg-[var(--brand-green)]" /> {label}
    </div>
  );
}

function TopBar() {
  return (
    <div className="bg-[var(--brand-navy-deep)] text-white/90 text-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-5">
          <a href="mailto:info@organization.org" className="flex items-center gap-1.5 hover:text-[var(--brand-green)]"><Mail className="h-3.5 w-3.5 text-[var(--brand-green)]" /> info@organization.org</a>
          <a href="tel:+252612345678" className="flex items-center gap-1.5 hover:text-[var(--brand-green)]"><Phone className="h-3.5 w-3.5 text-[var(--brand-green)]" /> +252 61 2345678</a>
          <span className="hidden md:flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[var(--brand-green)]" /> Mon - Fri: 8:00AM - 5:00PM</span>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> English <ChevronDown className="h-3 w-3" /></button>
          <div className="flex items-center gap-3 text-white/80">
            <a href="#" aria-label="Facebook"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="Twitter"><Twitter className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="Instagram"><Instagram className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="YouTube"><Youtube className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
        <Logo />
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[var(--brand-navy)]">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="relative flex items-center gap-1 hover:text-[var(--brand-green-dark)] transition-colors data-[status=active]:text-[var(--brand-green-dark)] group"
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-[var(--brand-green)] transition-transform group-data-[status=active]:scale-x-100" />
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Search" className="grid h-10 w-10 place-items-center rounded border border-border text-[var(--brand-navy)] hover:border-[var(--brand-green)]"><Search className="h-4 w-4" /></button>
          <Link to="/donate" className="inline-flex items-center gap-2 rounded bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 transition">
            Donate <Heart className="h-4 w-4 fill-white" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const cols = [
    { title: "Quick Links", items: [
      { label: "About Us", to: "/about" },
      { label: "Our Programs", to: "/programs" },
      { label: "Our Projects", to: "/projects" },
      { label: "News & Updates", to: "/news" },
      { label: "Events", to: "/events" },
      { label: "Contact", to: "/contact" },
    ]},
    { title: "Resources", items: [
      { label: "Publications", to: "/about" },
      { label: "Reports", to: "/about" },
      { label: "Gallery", to: "/projects" },
      { label: "FAQs", to: "/contact" },
      { label: "Downloads", to: "/about" },
      { label: "Privacy Policy", to: "/contact" },
    ]},
  ];
  return (
    <footer className="bg-[var(--brand-navy-deep)] text-white/85">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo light />
          <p className="mt-4 text-xs leading-relaxed text-white/70">
            We are committed to building a better future by empowering communities and creating sustainable solutions.
          </p>
          <div className="mt-5 flex gap-3 text-white/70">
            <a href="#" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-semibold text-white">{c.title}</h4>
            <ul className="mt-4 space-y-2 text-xs text-white/70">
              {c.items.map((i) => <li key={i.label}><Link to={i.to} className="hover:text-[var(--brand-green)]">{i.label}</Link></li>)}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="font-semibold text-white">Contact Us</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/70">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-[var(--brand-green)]" /> KM4, Hodan District<br />Mogadishu, Somalia</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 text-[var(--brand-green)]" /> +252 61 2345678</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 text-[var(--brand-green)]" /> info@uff.org</li>
            <li className="flex gap-2"><Clock className="h-4 w-4 text-[var(--brand-green)]" /> Mon - Fri: 8AM - 5PM</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Newsletter</h4>
          <p className="mt-4 text-xs text-white/70">Subscribe to our newsletter to get the latest updates and news.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); (e.currentTarget as HTMLFormElement).reset(); alert("Thanks for subscribing!"); }}
            className="mt-4 space-y-3"
          >
            <input required type="email" placeholder="Enter your email" className="w-full rounded bg-white px-3 py-2.5 text-xs text-[var(--brand-navy)] outline-none" />
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-green)] py-2.5 text-xs font-semibold text-white hover:brightness-110 transition">
              Subscribe <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[11px] text-white/60">
          <div>© 2025 Unique Future Foundation (UFF). All Rights Reserved.</div>
          <div className="flex gap-5">
            <Link to="/contact" className="hover:text-white">Terms of Use</Link>
            <Link to="/contact" className="hover:text-white">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ScrollTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-[var(--brand-navy)] shadow-md hover:bg-[var(--brand-green)] hover:text-white transition"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

export function PageHero({ title, breadcrumb }: { title: string; breadcrumb: string }) {
  return (
    <section className="relative bg-[var(--brand-navy)] py-20 text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-navy-deep)] via-[var(--brand-navy)] to-[var(--brand-green-dark)]/40" />
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold">{title}</h1>
        <div className="mt-3 text-sm text-white/70">
          <Link to="/" className="hover:text-[var(--brand-green)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--brand-green)]">{breadcrumb}</span>
        </div>
      </div>
    </section>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
      <TopBar />
      <Header />
      <main>{children}</main>
      <Footer />
      <ScrollTop />
    </div>
  );
}