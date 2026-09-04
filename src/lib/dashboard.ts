import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { decryptSecret } from "@/lib/crypto";
import { catalog } from "@/db/catalog";
import type { Order } from "@/db/schema";

export interface DashboardOrder {
  orderNumber: string;
  productTitle: string | null;
  amountPaidBdt: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  warrantyDays: number;
  /** True when the order was placed within its warranty window. */
  warrantyActive: boolean;
  warrantyEndsAt: string;
  delivery: { type: string; data: string; instructions?: string[] } | null;
}

function warrantyFor(slug: string | undefined): number {
  if (!slug) return 30;
  const found = catalog.find((p) => p.slug === slug);
  return found?.warrantyDays ?? 30;
}

/** Load a user's orders for the dashboard, decrypting deliveries for delivered orders. */
export async function getDashboardOrders(email: string): Promise<DashboardOrder[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerEmail, email.toLowerCase().trim()))
    .orderBy(orders.createdAt);

  // Newest first.
  rows.reverse();

  return rows.map((o: Order) => {
    let delivery: DashboardOrder["delivery"] = null;
    if (o.status === "DELIVERED" && o.delivery && o.deliveredDataEncrypted) {
      try {
        delivery = { ...o.delivery, data: decryptSecret(o.deliveredDataEncrypted) };
      } catch {
        delivery = null;
      }
    }

    const created = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
    const warrantyDays = warrantyFor(o.productSnapshot?.slug);
    const warrantyEnds = new Date(created.getTime() + warrantyDays * 86400000);

    return {
      orderNumber: o.orderNumber,
      productTitle: o.productSnapshot?.title ?? null,
      amountPaidBdt: String(o.amountPaidBdt),
      paymentMethod: o.paymentMethod,
      status: o.status,
      createdAt: created.toISOString(),
      warrantyDays,
      warrantyActive:
        o.status === "DELIVERED" && warrantyDays > 0 && warrantyEnds.getTime() > Date.now(),
      warrantyEndsAt: warrantyEnds.toISOString(),
      delivery,
    };
  });
}
