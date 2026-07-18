import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { query, ensureSchema } from "./db";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SiteSettings = Record<string, string>;

export type CmsEvent = {
  id: number;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
  sort_order: number;
};

export type NewsArticle = {
  id: number;
  title: string;
  published_date: string;
  excerpt: string | null;
  image_url: string;
  sort_order: number;
};

export type CmsProject = {
  id: number;
  title: string;
  location: string | null;
  category: string | null;
  image_url: string;
  sort_order: number;
};

export type ProgramData = {
  slug: string;
  title: string;
  tagline: string | null;
  summary: string | null;
  highlights: { title: string; text: string }[];
  stats: { n: string; l: string }[];
};

export type DashboardStats = {
  eventCount: number;
  newsCount: number;
  projectCount: number;
  submissionCount: number;
  donationCount: number;
  totalRaisedCents: number;
};

// ── Auth helper ───────────────────────────────────────────────────────────────

const AuthSchema = z.object({ password: z.string().min(1) });

function requireAdmin(password: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || password !== secret) throw new Error("Unauthorized");
}

// ── Public: verify password ───────────────────────────────────────────────────

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .validator((d: unknown) => AuthSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    return { ok: true };
  });

// ── Public: settings ──────────────────────────────────────────────────────────

export const getPublicSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSchema();
    const r = await query(`SELECT key, value FROM site_settings`);
    const map: SiteSettings = {};
    for (const row of r.rows) map[row.key] = row.value;
    return { settings: map };
  });

// ── Admin: update settings ────────────────────────────────────────────────────

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ password: z.string(), settings: z.record(z.string()) }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    for (const [k, v] of Object.entries(data.settings)) {
      await query(
        `INSERT INTO site_settings (key, value) VALUES ($1,$2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [k, v],
      );
    }
    return { ok: true };
  });

// ── Public: events ────────────────────────────────────────────────────────────

export const getPublicEvents = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSchema();
    const r = await query(
      `SELECT id, title, event_date, event_time, location, description, sort_order
       FROM events ORDER BY sort_order, event_date`,
    );
    return { events: r.rows as CmsEvent[] };
  });

// ── Admin: events CRUD ────────────────────────────────────────────────────────

const EventSchema = z.object({
  password: z.string(),
  title: z.string().min(1),
  event_date: z.string().min(1),
  event_time: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  sort_order: z.number().default(0),
});

export const adminCreateEvent = createServerFn({ method: "POST" })
  .validator((d: unknown) => EventSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(
      `INSERT INTO events (title, event_date, event_time, location, description, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [data.title, data.event_date, data.event_time ?? null, data.location ?? null, data.description ?? null, data.sort_order],
    );
    return { ok: true };
  });

export const adminUpdateEvent = createServerFn({ method: "POST" })
  .validator((d: unknown) => EventSchema.extend({ id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(
      `UPDATE events SET title=$1, event_date=$2, event_time=$3, location=$4, description=$5, sort_order=$6 WHERE id=$7`,
      [data.title, data.event_date, data.event_time ?? null, data.location ?? null, data.description ?? null, data.sort_order, data.id],
    );
    return { ok: true };
  });

export const adminDeleteEvent = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ password: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(`DELETE FROM events WHERE id=$1`, [data.id]);
    return { ok: true };
  });

// ── Public: news ──────────────────────────────────────────────────────────────

export const getPublicNews = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSchema();
    const r = await query(
      `SELECT id, title, published_date, excerpt, image_url, sort_order
       FROM news_articles ORDER BY sort_order, published_date DESC`,
    );
    return { articles: r.rows as NewsArticle[] };
  });

// ── Admin: news CRUD ──────────────────────────────────────────────────────────

const NewsSchema = z.object({
  password: z.string(),
  title: z.string().min(1),
  published_date: z.string().min(1),
  excerpt: z.string().optional(),
  image_url: z.string().optional(),
  sort_order: z.number().default(0),
});

export const adminCreateNews = createServerFn({ method: "POST" })
  .validator((d: unknown) => NewsSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(
      `INSERT INTO news_articles (title, published_date, excerpt, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)`,
      [data.title, data.published_date, data.excerpt ?? null, data.image_url ?? "", data.sort_order],
    );
    return { ok: true };
  });

export const adminUpdateNews = createServerFn({ method: "POST" })
  .validator((d: unknown) => NewsSchema.extend({ id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(
      `UPDATE news_articles SET title=$1, published_date=$2, excerpt=$3, image_url=$4, sort_order=$5 WHERE id=$6`,
      [data.title, data.published_date, data.excerpt ?? null, data.image_url ?? "", data.sort_order, data.id],
    );
    return { ok: true };
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ password: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(`DELETE FROM news_articles WHERE id=$1`, [data.id]);
    return { ok: true };
  });

// ── Public: projects ──────────────────────────────────────────────────────────

export const getPublicProjects = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSchema();
    const r = await query(
      `SELECT id, title, location, category, image_url, sort_order
       FROM projects ORDER BY sort_order, id`,
    );
    return { projects: r.rows as CmsProject[] };
  });

// ── Admin: projects CRUD ──────────────────────────────────────────────────────

const ProjectSchema = z.object({
  password: z.string(),
  title: z.string().min(1),
  location: z.string().optional(),
  category: z.string().optional(),
  image_url: z.string().optional(),
  sort_order: z.number().default(0),
});

export const adminCreateProject = createServerFn({ method: "POST" })
  .validator((d: unknown) => ProjectSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(
      `INSERT INTO projects (title, location, category, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)`,
      [data.title, data.location ?? null, data.category ?? null, data.image_url ?? "", data.sort_order],
    );
    return { ok: true };
  });

export const adminUpdateProject = createServerFn({ method: "POST" })
  .validator((d: unknown) => ProjectSchema.extend({ id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(
      `UPDATE projects SET title=$1, location=$2, category=$3, image_url=$4, sort_order=$5 WHERE id=$6`,
      [data.title, data.location ?? null, data.category ?? null, data.image_url ?? "", data.sort_order, data.id],
    );
    return { ok: true };
  });

export const adminDeleteProject = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ password: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(`DELETE FROM projects WHERE id=$1`, [data.id]);
    return { ok: true };
  });

// ── Public: programs ──────────────────────────────────────────────────────────

export const getPublicProgram = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await ensureSchema();
    const r = await query(`SELECT * FROM programs WHERE slug=$1`, [data.slug]);
    if (r.rows.length === 0) return { program: null };
    return { program: r.rows[0] as ProgramData };
  });

export const getPublicPrograms = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSchema();
    const r = await query(`SELECT * FROM programs ORDER BY slug`);
    return { programs: r.rows as ProgramData[] };
  });

// ── Admin: programs update ────────────────────────────────────────────────────

const HighlightSchema = z.object({ title: z.string(), text: z.string() });
const StatSchema = z.object({ n: z.string(), l: z.string() });

export const adminUpdateProgram = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      password: z.string(),
      slug: z.string(),
      title: z.string().min(1),
      tagline: z.string().optional(),
      summary: z.string().optional(),
      highlights: z.array(HighlightSchema).optional(),
      stats: z.array(StatSchema).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    await query(
      `UPDATE programs SET title=$1, tagline=$2, summary=$3, highlights=$4::jsonb, stats=$5::jsonb WHERE slug=$6`,
      [
        data.title,
        data.tagline ?? null,
        data.summary ?? null,
        JSON.stringify(data.highlights ?? []),
        JSON.stringify(data.stats ?? []),
        data.slug,
      ],
    );
    return { ok: true };
  });

// ── Admin: dashboard stats ────────────────────────────────────────────────────

export const adminGetDashboardStats = createServerFn({ method: "POST" })
  .validator((d: unknown) => AuthSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    await ensureSchema();
    const [evts, news, projs, subs, doms] = await Promise.all([
      query(`SELECT COUNT(*) FROM events`),
      query(`SELECT COUNT(*) FROM news_articles`),
      query(`SELECT COUNT(*) FROM projects`),
      query(`SELECT COUNT(*) FROM contact_submissions`),
      query(`SELECT COUNT(*), COALESCE(SUM(amount_cents),0) AS total FROM donations`),
    ]);
    return {
      stats: {
        eventCount: parseInt(evts.rows[0].count),
        newsCount: parseInt(news.rows[0].count),
        projectCount: parseInt(projs.rows[0].count),
        submissionCount: parseInt(subs.rows[0].count),
        donationCount: parseInt(doms.rows[0].count),
        totalRaisedCents: parseInt(doms.rows[0].total),
      } satisfies DashboardStats,
    };
  });
