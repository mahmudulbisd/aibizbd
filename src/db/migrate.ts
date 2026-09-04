import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { requireConnection } from "./index";

/**
 * Applies Drizzle migrations to the production database.
 *
 * Uses the direct/non-pooling connection (POSTGRES_URL_NON_POOLING, else
 * POSTGRES_URL / DATABASE_URL) because Neon's pooled (pgbouncer) connection is
 * transaction-mode only and forbids the multi-statement DDL in migrations.
 *
 * Run: npm run db:migrate
 */
async function main() {
  const url =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL;

  if (!url) {
    console.warn(
      "⚠️  Skipping database migrations: No database connection string set (POSTGRES_URL or DATABASE_URL). Add it to your Vercel Project Settings or connect Vercel Postgres / Neon.",
    );
    return;
  }

  const sql = await requireConnection();
  const db = drizzle(sql);
  console.log("Applying migrations from ./drizzle …");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
  await sql.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
