import "server-only";
import { desc, sql } from "drizzle-orm";
import { db, dbHealthy } from "@/db";
import { orders, products } from "@/db/schema";
import { catalog, type CatalogProduct } from "@/db/catalog";
import { siteConfig } from "@/lib/site";
import type { Order } from "@/db/schema";

export interface AdminStats {
  totalRevenueBdt: number;
  totalOrders: number;
  paidOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  processingOrders: number;
  failedOrders: number;
}

export async function getAdminOverviewStats(): Promise<{
  stats: AdminStats;
  recentOrders: Order[];
  isDbConnected: boolean;
}> {
  const isDbConnected = await dbHealthy();
  if (!isDbConnected) {
    return {
      stats: {
        totalRevenueBdt: 0,
        totalOrders: 0,
        paidOrders: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        failedOrders: 0,
      },
      recentOrders: [],
      isDbConnected: false,
    };
  }

  try {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(100);

    let totalRevenueBdt = 0;
    let paidOrders = 0;
    let deliveredOrders = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let failedOrders = 0;

    for (const o of allOrders) {
      if (o.status === "PAID" || o.status === "DELIVERED") {
        totalRevenueBdt += Number(o.amountPaidBdt ?? 0);
      }
      if (o.status === "PAID") paidOrders++;
      else if (o.status === "DELIVERED") deliveredOrders++;
      else if (o.status === "PENDING") pendingOrders++;
      else if (o.status === "PROCESSING") processingOrders++;
      else if (o.status === "FAILED" || o.status === "REFUNDED") failedOrders++;
    }

    return {
      stats: {
        totalRevenueBdt,
        totalOrders: allOrders.length,
        paidOrders,
        deliveredOrders,
        pendingOrders,
        processingOrders,
        failedOrders,
      },
      recentOrders: allOrders.slice(0, 8),
      isDbConnected: true,
    };
  } catch {
    return {
      stats: {
        totalRevenueBdt: 0,
        totalOrders: 0,
        paidOrders: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        failedOrders: 0,
      },
      recentOrders: [],
      isDbConnected: false,
    };
  }
}

export async function getAllAdminOrders(): Promise<Order[]> {
  const isDbConnected = await dbHealthy();
  if (!isDbConnected) return [];
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  } catch {
    return [];
  }
}

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

export async function getAdminCatalog(): Promise<AdminCatalogItem[]> {
  const isDbConnected = await dbHealthy();
  if (isDbConnected) {
    try {
      const dbProducts = await db.select().from(products);
      if (dbProducts.length > 0) return dbProducts as unknown as AdminCatalogItem[];
    } catch {
      // fallback to seed catalog
    }
  }

  return catalog.map((p: CatalogProduct, idx: number): AdminCatalogItem => ({
    id: `seed-${idx}`,
    slug: p.slug,
    title: p.title,
    description: p.description,
    features: p.features,
    priceBdt: String(p.priceBdt),
    priceUsd: String(p.priceUsd),
    wholesaleCostUsd: String(p.wholesaleCostUsd),
    providerType: p.providerType,
    externalProviderId: p.externalProviderId ?? null,
    deliveryType: p.deliveryType,
    warrantyDays: p.warrantyDays,
    isActive: true,
    createdAt: new Date(),
  }));
}

export function getSystemDiagnostics() {
  const hasEncryptionKey = Boolean(
    process.env.ENCRYPTION_KEY &&
      Buffer.from(process.env.ENCRYPTION_KEY, "base64").length === 32,
  );

  return {
    database: {
      provider: process.env.POSTGRES_URL ? "Supabase / Neon (POSTGRES_URL)" : process.env.DATABASE_URL ? "Custom Postgres (DATABASE_URL)" : "Not Configured",
      isConfigured: Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL),
    },
    auth: {
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY),
      mode: process.env.ADMIN_PASSWORD ? "Custom Environment Key" : "Default Security Key",
    },
    encryption: {
      algorithm: "AES-256-GCM",
      isConfigured: hasEncryptionKey,
      note: hasEncryptionKey ? "32-byte master key active" : "Missing or invalid ENCRYPTION_KEY",
    },
    payments: {
      provider: process.env.PAYMENT_PROVIDER ?? "mock (Auto-verifies without live keys)",
      hasBkash: Boolean(process.env.BKASH_APP_KEY && process.env.BKASH_APP_SECRET),
      hasBinance: Boolean(process.env.BINANCE_PAY_API_KEY && process.env.BINANCE_PAY_API_SECRET),
    },
    supplier: {
      provider: process.env.FULFILLMENT_PROVIDER ?? "mock (Mock instant delivery)",
      hasProdSellerKey: Boolean(process.env.PRODSELLER_API_KEY),
    },
    alerts: {
      hasTelegramBot: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      hasTelegramChatId: Boolean(process.env.TELEGRAM_ADMIN_CHAT_ID),
      status: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID)
        ? "Active (Instant Bot Notifications)"
        : "Console Log Only (Set TELEGRAM_BOT_TOKEN & CHAT_ID to enable)",
    },
    site: {
      name: siteConfig.name,
      url: siteConfig.url,
      whatsapp: siteConfig.supportWhatsApp,
      email: siteConfig.contactEmail,
      location: siteConfig.location,
    },
  };
}
