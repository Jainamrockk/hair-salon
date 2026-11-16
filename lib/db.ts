import "server-only";
import { SCHEMA } from "./schema";
import { seed } from "./seed-run";

type Row = Record<string, any>;
type Exec = (text: string, params?: unknown[]) => Promise<Row[]>;

const g = globalThis as unknown as { __salonDb?: Promise<Exec> };

async function connect(): Promise<Exec> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  let exec: Exec;
  let execMany: (sql: string) => Promise<void>;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    exec = async (text, params = []) => (await sql.query(text, params as any[])) as Row[];
    execMany = async (s) => {
      for (const stmt of s.split(";").map((x) => x.trim()).filter(Boolean)) await sql.query(stmt);
    };
  } else {
    // No DATABASE_URL: run a real embedded Postgres (PGlite) so the site works out of the box.
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite(process.env.VERCEL ? undefined : "./.pglite");
    exec = async (text, params = []) => (await db.query(text, params as any[])).rows as Row[];
    execMany = async (s) => { await db.exec(s); };
  }
  await execMany(SCHEMA);
  const lock = await exec(
    `INSERT INTO settings (key, value) VALUES ('seeded', 'true'::jsonb) ON CONFLICT (key) DO NOTHING RETURNING key`,
  );
  if (lock.length) await seed(exec);
  return exec;
}

export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  if (!g.__salonDb) g.__salonDb = connect().catch((e) => { g.__salonDb = undefined; throw e; });
  const exec = await g.__salonDb;
  return (await exec(text, params)) as T[];
}
export async function one<T = Row>(text: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(text, params))[0];
}
