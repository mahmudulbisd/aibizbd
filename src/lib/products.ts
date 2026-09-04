import { db, dbHealthy } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";
import type { Product } from "@/db/schema";
import { catalog } from "@/db/catalog";

/** Static fallback catalog so pages render before/without Postgres. */
const fallbackProducts: Product[] = catalog.map((p, i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  slug: p.slug,
  title: p.title,
  description: p.description,
  features: p.features,
  priceBdt: p.priceBdt,
  priceUsd: p.priceUsd,
  wholesaleCostUsd: p.wholesaleCostUsd,
  providerType: p.providerType,
  externalProviderId: p.externalProviderId,
  deliveryType: p.deliveryType,
  warrantyDays: p.warrantyDays,
  isActive: true,
  createdAt: new Date(),
}));

/** Fetch all active products (DB first, static fallback). Memoized per request via React cache. */
export const getActiveProducts = cache(async (): Promise<Product[]> => {
  if (!(await dbHealthy())) return fallbackProducts;
  try {
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(products.createdAt);
    return rows.length > 0 ? rows : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const list = await getActiveProducts();
  return list.find((p) => p.slug === slug) ?? null;
});
