import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { query, ensureSchema } from "./db";
import { verifyStaffToken } from "./auth-fn";

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
  image_url: string;
  video_url: string;
  highlights: { title: string; text: string }[];
  stats: { n: string; l: string }[];
};

export type HeroSlide = {
  id: number;
  image_url: string;
  headline: string;
  subtext: string;
  badge_text: string;
  cta_label: string;
  cta_to: string;
  sort_order: number;
  active: boolean;
};

export type EventMedia = {
  id: number;
  event_id: number;
  type: "image" | "video";
  url: string;
  caption: string;
  sort_order: number;
};

export type GalleryPhoto = {
  id: number;
  image_url: string;
  caption: string;
  category: string;
  sort_order: number;
};

export type CmsReport = {
  id: number;
  title: string;
  year: string;
  report_type: string;
  description: string;
  file_url: string;
  sort_order: number;
};

export type DashboardStats = {
  eventCount: number;
  newsCount: number;
  projectCount: number;
  submissionCount: number;
  galleryCount: number;
  reportCount: number;
  userCount: number;
};

// ── Auth helper ───────────────────────────────────────────────────────────────

const AuthSchema = z.object({ token: z.string().min(1) });

function requireAdmin(token: string) {
  const secret = process.env.SESSION_SECRET;
  try { verifyStaffToken(token); } catch(e) { throw new Error("Unauthorized"); }
}


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
    z.object({ token: z.string(), settings: z.record(z.string()) }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
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
  token: z.string(),
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
    requireAdmin(data.token);
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
    requireAdmin(data.token);
    await ensureSchema();
    await query(
      `UPDATE events SET title=$1, event_date=$2, event_time=$3, location=$4, description=$5, sort_order=$6 WHERE id=$7`,
      [data.title, data.event_date, data.event_time ?? null, data.location ?? null, data.description ?? null, data.sort_order, data.id],
    );
    return { ok: true };
  });

export const adminDeleteEvent = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
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
  token: z.string(),
  title: z.string().min(1),
  published_date: z.string().min(1),
  excerpt: z.string().optional(),
  image_url: z.string().optional(),
  sort_order: z.number().default(0),
});

export const adminCreateNews = createServerFn({ method: "POST" })
  .validator((d: unknown) => NewsSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
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
    requireAdmin(data.token);
    await ensureSchema();
    await query(
      `UPDATE news_articles SET title=$1, published_date=$2, excerpt=$3, image_url=$4, sort_order=$5 WHERE id=$6`,
      [data.title, data.published_date, data.excerpt ?? null, data.image_url ?? "", data.sort_order, data.id],
    );
    return { ok: true };
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
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
  token: z.string(),
  title: z.string().min(1),
  location: z.string().optional(),
  category: z.string().optional(),
  image_url: z.string().optional(),
  sort_order: z.number().default(0),
});

export const adminCreateProject = createServerFn({ method: "POST" })
  .validator((d: unknown) => ProjectSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
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
    requireAdmin(data.token);
    await ensureSchema();
    await query(
      `UPDATE projects SET title=$1, location=$2, category=$3, image_url=$4, sort_order=$5 WHERE id=$6`,
      [data.title, data.location ?? null, data.category ?? null, data.image_url ?? "", data.sort_order, data.id],
    );
    return { ok: true };
  });

export const adminDeleteProject = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
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
    const r = await query(`SELECT slug,title,tagline,summary,image_url,video_url,highlights,stats FROM programs ORDER BY slug`);
    return { programs: r.rows as ProgramData[] };
  });

// ── Admin: programs CRUD ──────────────────────────────────────────────────────

const HighlightSchema = z.object({ title: z.string(), text: z.string() });
const StatSchema = z.object({ n: z.string(), l: z.string() });

export const adminCreateProgram = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      token: z.string(),
      slug: z.string().min(1),
      title: z.string().min(1),
      tagline: z.string().optional(),
      summary: z.string().optional(),
      image_url: z.string().optional(),
      video_url: z.string().optional(),
      highlights: z.array(HighlightSchema).optional(),
      stats: z.array(StatSchema).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    await query(
      `INSERT INTO programs (slug, title, tagline, summary, image_url, video_url, highlights, stats)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)`,
      [
        data.slug,
        data.title,
        data.tagline ?? null,
        data.summary ?? null,
        data.image_url ?? "",
        data.video_url ?? "",
        JSON.stringify(data.highlights ?? []),
        JSON.stringify(data.stats ?? []),
      ],
    );
    return { ok: true };
  });

export const adminDeleteProgram = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    await query(`DELETE FROM programs WHERE slug=$1`, [data.slug]);
    return { ok: true };
  });

export const adminUpdateProgram = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      token: z.string(),
      slug: z.string(),
      title: z.string().min(1),
      tagline: z.string().optional(),
      summary: z.string().optional(),
      image_url: z.string().optional(),
      video_url: z.string().optional(),
      highlights: z.array(HighlightSchema).optional(),
      stats: z.array(StatSchema).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    await query(
      `UPDATE programs SET title=$1,tagline=$2,summary=$3,image_url=$4,video_url=$5,highlights=$6::jsonb,stats=$7::jsonb WHERE slug=$8`,
      [
        data.title,
        data.tagline ?? null,
        data.summary ?? null,
        data.image_url ?? "",
        data.video_url ?? "",
        JSON.stringify(data.highlights ?? []),
        JSON.stringify(data.stats ?? []),
        data.slug,
      ],
    );
    return { ok: true };
  });

// ── Hero Slides ───────────────────────────────────────────────────────────────

export const getPublicHeroSlides = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSchema();
    const r = await query(`SELECT * FROM hero_slides WHERE active=TRUE ORDER BY sort_order, id`);
    return { slides: r.rows as HeroSlide[] };
  });

export const adminGetHeroSlides = createServerFn({ method: "POST" })
  .validator((d: unknown) => AuthSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(`SELECT * FROM hero_slides ORDER BY sort_order, id`);
    return { slides: r.rows as HeroSlide[] };
  });

export const adminCreateSlide = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      token: z.string(),
      image_url: z.string(),
      headline: z.string().optional(),
      subtext: z.string().optional(),
      badge_text: z.string().optional(),
      cta_label: z.string().optional(),
      cta_to: z.string().optional(),
      sort_order: z.number().optional(),
      active: z.boolean().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(
      `INSERT INTO hero_slides (image_url,headline,subtext,badge_text,cta_label,cta_to,sort_order,active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [data.image_url, data.headline ?? "", data.subtext ?? "", data.badge_text ?? "",
       data.cta_label ?? "", data.cta_to ?? "", data.sort_order ?? 0, data.active ?? true],
    );
    return { slide: r.rows[0] as HeroSlide };
  });

export const adminUpdateSlide = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      token: z.string(),
      id: z.number(),
      image_url: z.string(),
      headline: z.string().optional(),
      subtext: z.string().optional(),
      badge_text: z.string().optional(),
      cta_label: z.string().optional(),
      cta_to: z.string().optional(),
      sort_order: z.number().optional(),
      active: z.boolean().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    await query(
      `UPDATE hero_slides SET image_url=$1,headline=$2,subtext=$3,badge_text=$4,cta_label=$5,cta_to=$6,sort_order=$7,active=$8 WHERE id=$9`,
      [data.image_url, data.headline ?? "", data.subtext ?? "", data.badge_text ?? "",
       data.cta_label ?? "", data.cta_to ?? "", data.sort_order ?? 0, data.active ?? true, data.id],
    );
    return { ok: true };
  });

export const adminDeleteSlide = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    await query(`DELETE FROM hero_slides WHERE id=$1`, [data.id]);
    return { ok: true };
  });

// ── Event Media ───────────────────────────────────────────────────────────────

export const getEventMedia = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ event_id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    await ensureSchema();
    const r = await query(
      `SELECT * FROM event_media WHERE event_id=$1 ORDER BY sort_order, id`,
      [data.event_id],
    );
    return { media: r.rows as EventMedia[] };
  });

export const adminAddEventMedia = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      token: z.string(),
      event_id: z.number(),
      type: z.enum(["image", "video"]),
      url: z.string().min(1),
      caption: z.string().optional(),
      sort_order: z.number().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(
      `INSERT INTO event_media (event_id,type,url,caption,sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.event_id, data.type, data.url, data.caption ?? "", data.sort_order ?? 0],
    );
    return { media: r.rows[0] as EventMedia };
  });

export const adminDeleteEventMedia = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    await query(`DELETE FROM event_media WHERE id=$1`, [data.id]);
    return { ok: true };
  });

// ── Public: gallery ───────────────────────────────────────────────────────────

export const getPublicGallery = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSchema();
    const r = await query(`SELECT * FROM gallery_photos ORDER BY sort_order ASC, created_at DESC`);
    return { photos: r.rows as GalleryPhoto[] };
  });

// ── Admin: gallery ────────────────────────────────────────────────────────────

export const adminGetGallery = createServerFn({ method: "POST" })
  .validator((d: unknown) => AuthSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(`SELECT * FROM gallery_photos ORDER BY sort_order ASC, created_at DESC`);
    return { photos: r.rows as GalleryPhoto[] };
  });

export const adminCreateGalleryPhoto = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), image_url: z.string().min(1), caption: z.string().default(""), category: z.string().default("General"), sort_order: z.number().default(0) }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(
      `INSERT INTO gallery_photos (image_url, caption, category, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
      [data.image_url, data.caption, data.category, data.sort_order],
    );
    return { photo: r.rows[0] as GalleryPhoto };
  });

export const adminUpdateGalleryPhoto = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number(), image_url: z.string().min(1), caption: z.string().default(""), category: z.string().default("General"), sort_order: z.number().default(0) }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(
      `UPDATE gallery_photos SET image_url=$1, caption=$2, category=$3, sort_order=$4 WHERE id=$5 RETURNING *`,
      [data.image_url, data.caption, data.category, data.sort_order, data.id],
    );
    return { photo: r.rows[0] as GalleryPhoto };
  });

export const adminDeleteGalleryPhoto = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    await query(`DELETE FROM gallery_photos WHERE id=$1`, [data.id]);
    return { ok: true };
  });

// ── Public: reports ───────────────────────────────────────────────────────────

export const getPublicReports = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSchema();
    const r = await query(`SELECT * FROM reports ORDER BY sort_order ASC, created_at DESC`);
    return { reports: r.rows as CmsReport[] };
  });

// ── Admin: reports ────────────────────────────────────────────────────────────

export const adminGetReports = createServerFn({ method: "POST" })
  .validator((d: unknown) => AuthSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(`SELECT * FROM reports ORDER BY sort_order ASC, created_at DESC`);
    return { reports: r.rows as CmsReport[] };
  });

export const adminCreateReport = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), title: z.string().min(1), year: z.string().default(""), report_type: z.string().default("Annual Report"), description: z.string().default(""), file_url: z.string().default(""), sort_order: z.number().default(0) }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(
      `INSERT INTO reports (title, year, report_type, description, file_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.title, data.year, data.report_type, data.description, data.file_url, data.sort_order],
    );
    return { report: r.rows[0] as CmsReport };
  });

export const adminUpdateReport = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number(), title: z.string().min(1), year: z.string().default(""), report_type: z.string().default("Annual Report"), description: z.string().default(""), file_url: z.string().default(""), sort_order: z.number().default(0) }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const r = await query(
      `UPDATE reports SET title=$1, year=$2, report_type=$3, description=$4, file_url=$5, sort_order=$6 WHERE id=$7 RETURNING *`,
      [data.title, data.year, data.report_type, data.description, data.file_url, data.sort_order, data.id],
    );
    return { report: r.rows[0] as CmsReport };
  });

export const adminDeleteReport = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string(), id: z.number() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    await query(`DELETE FROM reports WHERE id=$1`, [data.id]);
    return { ok: true };
  });

// ── Admin: dashboard stats ────────────────────────────────────────────────────

export const adminGetDashboardStats = createServerFn({ method: "POST" })
  .validator((d: unknown) => AuthSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    await ensureSchema();
    const [evts, news, projs, subs, gallery, rpts, users] = await Promise.all([
      query(`SELECT COUNT(*) FROM events`),
      query(`SELECT COUNT(*) FROM news_articles`),
      query(`SELECT COUNT(*) FROM projects`),
      query(`SELECT COUNT(*) FROM contact_submissions`),
      query(`SELECT COUNT(*) FROM gallery_photos`),
      query(`SELECT COUNT(*) FROM reports`),
      query(`SELECT COUNT(*) FROM staff_users`),
    ]);
    return {
      stats: {
        eventCount: parseInt(evts.rows[0].count),
        newsCount: parseInt(news.rows[0].count),
        projectCount: parseInt(projs.rows[0].count),
        submissionCount: parseInt(subs.rows[0].count),
        galleryCount: parseInt(gallery.rows[0].count),
        reportCount: parseInt(rpts.rows[0].count),
        userCount: parseInt(users.rows[0].count),
      } satisfies DashboardStats,
    };
  });
