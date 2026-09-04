import { db, dbHealthy } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";
import type { Product } from "@/db/schema";
import { catalog } from "@/db/catalog";

interface ProdSellerRawProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  publicPrice?: number;
  imageUrl?: string | null;
  delivery?: { type?: string };
  inStock?: boolean;
}

let memoryCache: { data: Product[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds cache

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Static fallback catalog so pages render before/without network or Postgres. */
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

/**
 * Fetch live products directly from ProdSeller API.
 * Maps live stock, wholesale prices, and merges curated catalog details.
 */
async function fetchLiveSupplierProducts(): Promise<Product[] | null> {
  const apiKey = process.env.PRODSELLER_API_KEY;
  const baseUrl = process.env.PRODSELLER_API_URL || "https://prodseller.com/v1";

  if (!apiKey) return null;

  try {
    const res = await fetch(`${baseUrl}/products`, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;

    const data = await res.json().catch(() => ({}));
    const rawList: ProdSellerRawProduct[] = Array.isArray(data)
      ? data
      : data.products ?? [];

    if (rawList.length === 0) return null;

    // Filter to only products that are currently in stock
    const inStockItems = rawList.filter((p) => p.inStock !== false);

    const mapped: Product[] = inStockItems.map((p, idx) => {
      // Check if we have a curated catalog entry for this ProdSeller product id
      const curated = catalog.find((c) => c.externalProviderId === p.id);

      const wholesaleCost = p.price;
      // Convert wholesale USD to BDT (~৳125/$) with ~45-50% markup, rounded to 10 BDT
      const computedBdt = Math.max(
        Math.ceil((wholesaleCost * 125 * 1.5) / 10) * 10,
        150,
      );

      const title = curated ? curated.title : p.name.trim();
      const slug = curated ? curated.slug : slugify(p.name);
      const desc = curated ? curated.description : (p.description || p.name);

      // Parse bullet features if not in curated catalog
      let features = curated ? curated.features : [];
      if (features.length === 0 && p.description) {
        features = p.description
          .split("\n")
          .map((l) => l.replace(/^[-•*✨🚀🔹⚡️\s]+/, "").trim())
          .filter((l) => l.length > 5 && !l.includes("http") && !l.includes("Step"))
          .slice(0, 4);
      }
      if (features.length === 0) {
        features = ["Instant digital delivery", "Verified replacement warranty", "24/7 WhatsApp customer support"];
      }

      // Determine delivery type
      let dType: Product["deliveryType"] = "CREDENTIALS";
      if (curated) {
        dType = curated.deliveryType;
      } else {
        const lower = (p.name + " " + (p.description || "")).toLowerCase();
        if (lower.includes("link") || lower.includes("invitation")) dType = "LINK";
        else if (lower.includes("key") || lower.includes("retail key") || lower.includes("code")) dType = "ACTIVATION_KEY";
      }

      return {
        id: p.id || `ps-${idx}`,
        slug,
        title,
        description: desc,
        features,
        priceBdt: curated ? curated.priceBdt : String(computedBdt),
        priceUsd: String((wholesaleCost * 1.5).toFixed(2)),
        wholesaleCostUsd: String(wholesaleCost),
        providerType: "TELEGRAM_BOT_API",
        externalProviderId: p.id,
        deliveryType: dType,
        warrantyDays: curated ? curated.warrantyDays : 30,
        isActive: true,
        createdAt: new Date(),
      };
    });

    return mapped.length > 0 ? mapped : null;
  } catch (err) {
    console.error("fetchLiveSupplierProducts error:", err);
    return null;
  }
}

/** Fetch all active products (ProdSeller API first -> DB -> static fallback). */
export const getActiveProducts = cache(async (): Promise<Product[]> => {
  // Test seam: when running integration tests, prioritize the test database.
  if (process.env.NODE_ENV === "test") {
    try {
      const rows = await db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(products.createdAt);
      if (rows.length > 0) return rows;
    } catch {
      // pass through
    }
    return fallbackProducts;
  }

  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.data;
  }

  // 1. Try Live ProdSeller API directly
  const liveProducts = await fetchLiveSupplierProducts();
  if (liveProducts && liveProducts.length > 0) {
    memoryCache = { data: liveProducts, timestamp: now };
    return liveProducts;
  }

  // 2. Fallback to Database if reachable
  if (await dbHealthy()) {
    try {
      const rows = await db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(products.createdAt);
      if (rows.length > 0) {
        memoryCache = { data: rows, timestamp: now };
        return rows;
      }
    } catch {
      // pass through
    }
  }

  // 3. Fallback to static catalog
  return fallbackProducts;
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const list = await getActiveProducts();
  return list.find((p) => p.slug === slug) ?? null;
});
