import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function query(sql: string, params?: unknown[]) {
  const client = await getPool().connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

let schemaInitialized = false;

export async function ensureSchema(): Promise<void> {
  if (schemaInitialized) return;

  // ── Existing tables ──────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id           SERIAL PRIMARY KEY,
      name         TEXT NOT NULL,
      email        TEXT NOT NULL,
      subject      TEXT,
      message      TEXT NOT NULL,
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // ── CMS tables ───────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      event_date  DATE NOT NULL,
      event_time  TEXT,
      location    TEXT,
      description TEXT,
      sort_order  INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS news_articles (
      id             SERIAL PRIMARY KEY,
      title          TEXT NOT NULL,
      published_date DATE NOT NULL,
      excerpt        TEXT,
      image_url      TEXT DEFAULT '',
      sort_order     INTEGER DEFAULT 0,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS projects (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      location   TEXT,
      category   TEXT,
      image_url  TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS programs (
      slug       TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      tagline    TEXT,
      summary    TEXT,
      highlights JSONB DEFAULT '[]',
      stats      JSONB DEFAULT '[]'
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS staff_users (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id         SERIAL PRIMARY KEY,
      image_url  TEXT NOT NULL DEFAULT '',
      headline   TEXT DEFAULT '',
      subtext    TEXT DEFAULT '',
      badge_text TEXT DEFAULT '',
      cta_label  TEXT DEFAULT '',
      cta_to     TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      active     BOOLEAN DEFAULT TRUE
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS event_media (
      id         SERIAL PRIMARY KEY,
      event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      type       TEXT NOT NULL DEFAULT 'image',
      url        TEXT NOT NULL,
      caption    TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id         SERIAL PRIMARY KEY,
      image_url  TEXT NOT NULL,
      caption    TEXT DEFAULT '',
      category   TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS reports (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      year        TEXT NOT NULL DEFAULT '',
      report_type TEXT NOT NULL DEFAULT 'Annual Report',
      description TEXT DEFAULT '',
      file_url    TEXT DEFAULT '',
      sort_order  INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Extend programs with media columns (safe to run repeatedly)
  await query(`ALTER TABLE programs ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''`);
  await query(`ALTER TABLE programs ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT ''`);
  // Extend staff_users with role column
  await query(`ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'editor'`);

  // ── Seed site_settings ───────────────────────────────────────────────
  const defaults: [string, string][] = [
    ["hero_headline", "Building a Better Future for All"],
    ["hero_subtext", "We work in partnership with local communities to create sustainable solutions that change lives and build a better tomorrow."],
    ["hero_badge", "Together We Can"],
    ["stat_1_n", "15+"], ["stat_1_l", "Projects Completed"],
    ["stat_2_n", "2+"],  ["stat_2_l", "Countries Served"],
    ["stat_3_n", "1,000+"], ["stat_3_l", "People Impacted"],
    ["stat_4_n", "10+"], ["stat_4_l", "Partners Worldwide"],
    ["impact_stat_1_n", "1,000+"], ["impact_stat_1_l", "People Impacted"],
    ["impact_stat_2_n", "2+"],     ["impact_stat_2_l", "Countries Served"],
    ["impact_stat_3_n", "15+"],    ["impact_stat_3_l", "Projects Completed"],
    ["impact_stat_4_n", "10+"],    ["impact_stat_4_l", "Partners & Supporters"],
    ["impact_stat_5_n", "5+"],     ["impact_stat_5_l", "Years of Experience"],
    ["impact_stat_6_n", "20+"],    ["impact_stat_6_l", "Dedicated Staff"],
    ["about_description", "Unique Future Foundation (UFF) is a non-profit, non-governmental organization working in partnership with communities and stakeholders to improve lives through sustainable programs in education, health, environment, and economic empowerment."],
    ["about_founded", "Founded in 2009, our teams are on the ground in more than 25 countries — designing programs with the people they serve, not for them."],
    ["mission_text", "To empower communities and create sustainable solutions for a better tomorrow."],
    ["vision_text", "A world where every individual has the opportunity to live a dignified and fulfilling life."],
    ["values_text", "Integrity, Transparency, Compassion, Collaboration, and Accountability."],
    ["goals_text", "To reduce poverty, promote education, improve health, and protect our planet."],
    // Contact info
    ["contact_phone", "+252 90 730 3587"],
    ["contact_email", "info@uniquefuturefoundation.org"],
    ["contact_address", "Mogadishu, Somalia"],
    ["contact_hours", "Mon - Fri: 8:00AM - 5:00PM"],
    // Social media links
    ["social_facebook",  "https://facebook.com"],
    ["social_instagram", "https://instagram.com"],
    ["social_twitter",   "https://twitter.com"],
    ["social_youtube",   "https://youtube.com"],
    // Google Maps embed URL (optional)
    ["contact_map_embed", ""],
  ];
  for (const [k, v] of defaults) {
    await query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [k, v],
    );
  }

  // ── Seed events ──────────────────────────────────────────────────────
  const evtCount = await query(`SELECT COUNT(*) FROM events`);
  if (parseInt(evtCount.rows[0].count) === 0) {
    const evts = [
      ["Annual Charity Gala 2024", "2024-06-12", "6:00 PM", "Nairobi, Kenya", "An evening of stories, music, and giving in support of our education programs.", 1],
      ["Community Health Fair", "2024-07-05", "9:00 AM", "Mogadishu, Somalia", "Free screenings, vaccinations, and healthy-living workshops for local families.", 2],
      ["Reforestation Volunteer Day", "2024-08-20", "10:00 AM", "Addis Ababa, Ethiopia", "Help us plant 10,000 trees in a single day — bring friends and family.", 3],
      ["Impact Report Webinar", "2024-09-14", "2:00 PM", "Online (Zoom)", "Meet our teams and hear directly from communities about the year's progress.", 4],
    ];
    for (const e of evts) {
      await query(
        `INSERT INTO events (title, event_date, event_time, location, description, sort_order) VALUES ($1,$2,$3,$4,$5,$6)`,
        e,
      );
    }
  }

  // ── Seed news ────────────────────────────────────────────────────────
  const newsCount = await query(`SELECT COUNT(*) FROM news_articles`);
  if (parseInt(newsCount.rows[0].count) === 0) {
    const articles = [
      ["UFF Launches New Education Program for Girls", "2024-05-20", "A new scholarship initiative will support 2,000 girls to complete secondary school.", "", 1],
      ["Clean Water Initiative Reaches 10,000 Communities", "2024-05-15", "Together with local partners, we've drilled hundreds of new wells this year.", "", 2],
      ["Annual Report 2023: A Year of Significant Impact", "2024-05-10", "Our 2023 annual report highlights progress across all four program areas.", "", 3],
      ["Field Story: A New Chapter in Mogadishu", "2024-04-28", "How one community rebuilt its school with parents, teachers, and neighbors leading the way.", "", 4],
      ["Partnering With Local Farmers for Food Security", "2024-04-15", "Drought-resistant seeds and training are helping farmers weather harder seasons.", "", 5],
      ["Volunteers Week: Meet the People Behind Our Work", "2024-04-02", "Celebrating the volunteers who make everything possible.", "", 6],
    ];
    for (const a of articles) {
      await query(
        `INSERT INTO news_articles (title, published_date, excerpt, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)`,
        a,
      );
    }
  }

  // ── Seed projects ────────────────────────────────────────────────────
  const projCount = await query(`SELECT COUNT(*) FROM projects`);
  if (parseInt(projCount.rows[0].count) === 0) {
    const projs = [
      ["Building Schools for a Better Future", "Mogadishu, Somalia", "Education", "", 1],
      ["Community Health Care Program", "Garowe, Somalia", "Health", "", 2],
      ["Clean Water Initiative", "Kismayo, Somalia", "Environment", "", 3],
      ["Girls' Scholarship Program", "Nairobi, Kenya", "Education", "", 4],
      ["Women's Cooperative Fund", "Kampala, Uganda", "Livelihood", "", 5],
      ["Reforestation Campaign", "Addis Ababa, Ethiopia", "Environment", "", 6],
    ];
    for (const p of projs) {
      await query(
        `INSERT INTO projects (title, location, category, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)`,
        p,
      );
    }
  }

  // ── Seed programs ────────────────────────────────────────────────────
  const progCount = await query(`SELECT COUNT(*) FROM programs`);
  if (parseInt(progCount.rows[0].count) === 0) {
    const progs = [
      {
        slug: "education",
        title: "Education",
        tagline: "Every child deserves the chance to learn.",
        summary: "Our education programs deliver quality schooling, teacher training, and scholarships to children across underserved communities — building classrooms, libraries, and futures.",
        highlights: [
          { title: "Classrooms Built", text: "We construct and rehabilitate schools that give children safe, dignified spaces to learn." },
          { title: "Girls' Education", text: "Targeted scholarships and mentoring so girls can complete their schooling." },
          { title: "Teacher Training", text: "We upskill local teachers so quality learning outlasts our programs." },
          { title: "School Feeding", text: "Daily meals so students can focus on class, not hunger." },
        ],
        stats: [{ n: "82", l: "Schools Built" }, { n: "45K+", l: "Students Enrolled" }, { n: "1,200", l: "Teachers Trained" }, { n: "18", l: "Countries" }],
      },
      {
        slug: "health",
        title: "Health",
        tagline: "Healthy communities are stronger communities.",
        summary: "We strengthen primary healthcare — clinics, mobile units, maternal care, and vaccination campaigns — bringing quality care to families who need it most.",
        highlights: [
          { title: "Maternal Care", text: "Safe pregnancies and childbirth through community midwives and clinics." },
          { title: "Vaccination Drives", text: "Reaching remote villages with life-saving immunizations." },
          { title: "Mobile Clinics", text: "Bringing doctors, medicines, and screenings to doorsteps." },
          { title: "Nutrition Programs", text: "Fighting malnutrition with food support and education." },
        ],
        stats: [{ n: "36", l: "Clinics Supported" }, { n: "310K", l: "Patients Treated" }, { n: "58K", l: "Children Vaccinated" }, { n: "22", l: "Mobile Units" }],
      },
      {
        slug: "environment",
        title: "Environment",
        tagline: "Protecting the planet for future generations.",
        summary: "From clean water to reforestation and climate resilience, our environmental programs help communities steward their land and adapt to a changing climate.",
        highlights: [
          { title: "Clean Water Wells", text: "Safe drinking water for schools, clinics, and villages." },
          { title: "Reforestation", text: "Millions of trees planted to restore land and fight erosion." },
          { title: "Climate Resilience", text: "Drought-resistant crops and community adaptation plans." },
          { title: "Waste Management", text: "Recycling and cleanup drives in growing urban areas." },
        ],
        stats: [{ n: "1.4M", l: "Trees Planted" }, { n: "240", l: "Wells Drilled" }, { n: "62", l: "Communities" }, { n: "9", l: "Countries" }],
      },
      {
        slug: "livelihood",
        title: "Livelihood",
        tagline: "Skills and opportunities to build stronger futures.",
        summary: "We equip women, youth, and farmers with training, micro-grants, and market access — turning skills into stable incomes and thriving small businesses.",
        highlights: [
          { title: "Vocational Training", text: "Tailored courses in tailoring, carpentry, mechanics, and tech." },
          { title: "Women's Cooperatives", text: "Groups that pool skills, savings, and market access." },
          { title: "Micro-Grants", text: "Seed funding to launch and grow small businesses." },
          { title: "Farmer Support", text: "Better seeds, tools, and training for smallholder farms." },
        ],
        stats: [{ n: "12K", l: "People Trained" }, { n: "3,400", l: "Businesses Launched" }, { n: "180", l: "Cooperatives" }, { n: "$2.1M", l: "In Micro-Grants" }],
      },
    ];
    for (const p of progs) {
      await query(
        `INSERT INTO programs (slug, title, tagline, summary, highlights, stats) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`,
        [p.slug, p.title, p.tagline, p.summary, JSON.stringify(p.highlights), JSON.stringify(p.stats)],
      );
    }
  }

  schemaInitialized = true;
}
