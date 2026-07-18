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

// Idempotent: safe to call on every startup or before first use.
let schemaInitialized = false;

export async function ensureSchema(): Promise<void> {
  if (schemaInitialized) return;
  await query(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      subject    TEXT,
      message    TEXT NOT NULL,
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  schemaInitialized = true;
}
