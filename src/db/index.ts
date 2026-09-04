import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __sql?: ReturnType<typeof postgres>;
  __db?: Database;
};

/**
 * Resolve the connection string with zero configuration friction.
 *
 * Order:
 *   1. POSTGRES_URL  — the pooled/transaction connection string Vercel +
 *      Neon inject automatically (Vercel Postgres / Neon integration).
 *   2. POSTGRES_URL_NON_POOLING — Neon's direct connection (for migrations
 *      that need DDL over the pooled pgbouncer port).
 *   3. DATABASE_URL  — any standard Postgres URL (local dev, Supabase, etc.)
 *
 * For the app runtime we connect WITHOUT pgbouncer connection pooling
 * (max: 1 idle per serverless invocation), which is the recommended Vercel
 * serverless + Neon pattern.
 */
function resolveUrl(): string | null {
  const url =
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL;
  return url ?? null;
}

function createSql(url: string) {
  return postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // serverless-safe (no session/statement caching across lambdas)
  });
}

function resolveSql() {
  if (globalForDb.__sql) return globalForDb.__sql;
  const url = resolveUrl();
  if (!url) return null;
  const sql = createSql(url);
  if (process.env.NODE_ENV !== "production") globalForDb.__sql = sql;
  return sql;
}

function resolveDb(): Database {
  // Test seam: an integration test may point this at an in-memory database.
  if (globalForDb.__db) return globalForDb.__db;
  const sql = resolveSql();
  if (!sql) {
    throw new Error(
      "No database connection string set. Add POSTGRES_URL or DATABASE_URL to your environment (.env).",
    );
  }
  return drizzle(sql, { schema });
}

/**
 * The app-wide Drizzle client.
 *
 * Implemented as a Proxy over a lazily-resolved client so pages can import it
 * safely before a database is configured (throws only when a query actually
 * runs), and so integration tests can swap in an in-memory DB.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    return (resolveDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/** Best-effort health check — returns false when the DB is unreachable/unset. */
export async function dbHealthy(): Promise<boolean> {
  if (globalForDb.__db) return true;
  const sql = globalForDb.__sql ?? resolveSql();
  if (!sql) return false;
  try {
    await sql`select 1`;
    return true;
  } catch {
    return false;
  }
}

/** @internal Test seam — point the app DB at an in-memory Drizzle client. */
export function __setTestDb(next: Database) {
  globalForDb.__db = next;
}

/** @internal Test seam — reset to the env-configured database. */
export function __resetTestDb() {
  globalForDb.__db = undefined;
}

/**
 * Create a dedicated connection for scripts (seed / migrate) that need to
 * issue DDL. Uses the NON-POOLING/direct URL so migrations aren't run through
 * pgbouncer's transaction-mode pool (which forbids multi-statement DDL).
 */
export async function requireConnection() {
  const url =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "No database connection string set. Add POSTGRES_URL or DATABASE_URL to your environment (.env).",
    );
  }
  const directUrl = process.env.POSTGRES_URL_NON_POOLING ?? url;
  return createSql(directUrl);
}
