---
name: Admin CMS Architecture
description: How the UFF admin dashboard CMS works — DB, server fns, auth, routing
---

## Auth
- Single password = `SESSION_SECRET` env var
- Stored in `sessionStorage` as `uff-admin-pw` / `uff-admin-authed`
- `admin.tsx` is a TanStack Router **layout route** — shows login screen or sidebar+Outlet
- Child admin routes get password via `AdminContext` (src/lib/admin-context.ts)
- `verifyAdminPassword` server fn confirms password server-side on login

## DB tables (all in ensureSchema)
- `site_settings` — key/value for hero, stats, mission, vision, values, goals, about text
- `events` — id, title, event_date (DATE), event_time, location, description, sort_order
- `news_articles` — id, title, published_date (DATE), excerpt, image_url, sort_order
- `projects` — id, title, location, category, image_url, sort_order
- `programs` — slug (PK), title, tagline, summary, highlights (JSONB), stats (JSONB)
- Existing: `contact_submissions`, `donations`

**Why:** Seeding runs once in ensureSchema via `INSERT ... ON CONFLICT DO NOTHING`

## PG DATE columns
PG returns DATE columns as JS Date objects (not strings). Always convert:
```ts
const raw = typeof v === "string" ? v.slice(0, 10) : v.toISOString().slice(0, 10);
```

## Seroval / SSR serialization
**Rule:** TanStack Start SSR serializes all loader return values. Never return React components (LucideIcon etc.) from a `loader`. Only return plain data. Resolved in programs.$slug.tsx — loader returns plain data, component maps slug → icon/color from static PROGRAMS array.

## File layout
- `src/lib/content-fn.ts` — all public + admin server functions
- `src/lib/admin-context.ts` — AdminContext + useAdmin()
- `src/routes/admin.tsx` — layout (auth + sidebar)
- `src/routes/admin.index.tsx` — redirects to /admin/dashboard
- `src/routes/admin.dashboard.tsx` — stat cards
- `src/routes/admin.events.tsx` — CRUD
- `src/routes/admin.news.tsx` — CRUD
- `src/routes/admin.projects.tsx` — CRUD
- `src/routes/admin.programs.tsx` — edit 4 programs (highlights + stats)
- `src/routes/admin.home-settings.tsx` — hero + impact stats
- `src/routes/admin.about-settings.tsx` — mission/vision/values/goals
- Admin submissions + donations: rewritten to use AdminContext (no own login)
- Public pages (events, news, projects, about): fetch from DB via useEffect

## Images
News and project images are URLs stored in DB. Seeded with empty strings. Fallback shows image placeholder icon. Admin can enter external URLs.
