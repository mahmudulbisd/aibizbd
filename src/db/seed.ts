import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, requireConnection } from "./index";
import { products } from "./schema";
import { catalog } from "./catalog";

async function seed() {
  console.log("Seeding product catalog…");
  let inserted = 0;
  for (const p of catalog) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, p.slug));
    if (existing.length > 0) {
      console.log(`  skip ${p.slug} (exists)`);
      continue;
    }
    await db.insert(products).values(p);
    inserted += 1;
    console.log(`  + ${p.slug}`);
  }
  console.log(`Done. Inserted ${inserted} new; ${catalog.length} total ensured.`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    const sql = await requireConnection().catch(() => null);
    if (sql) await sql.end();
  });
