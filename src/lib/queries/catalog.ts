import "server-only";
import { db, dbHealthy } from "@/db";
import { products } from "@/db/schema";
import { catalog, type CatalogProduct } from "@/db/catalog";

export interface AdminCatalogItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  features: string[];
  priceBdt: string;
  priceUsd: string | null;
  wholesaleCostUsd: string;
  providerType: string;
  externalProviderId: string | null;
  deliveryType: string;
  warrantyDays: number;
  isActive: boolean;
  createdAt: Date;
}

import { getActiveProducts } from "@/lib/products";

export async function getAdminCatalog(): Promise<AdminCatalogItem[]> {
  const live = await getActiveProducts();
  return live.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    features: p.features,
    priceBdt: String(p.priceBdt),
    priceUsd: p.priceUsd ? String(p.priceUsd) : null,
    wholesaleCostUsd: String(p.wholesaleCostUsd),
    providerType: p.providerType,
    externalProviderId: p.externalProviderId,
    deliveryType: p.deliveryType,
    warrantyDays: p.warrantyDays,
    isActive: p.isActive,
    createdAt: p.createdAt,
  }));
}
