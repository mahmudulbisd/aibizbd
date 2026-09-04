import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, dbHealthy } from "@/db";
import { orders } from "@/db/schema";
import { catalog } from "@/db/catalog";
import { decryptSecret } from "@/lib/crypto";
import type { Order } from "@/db/schema";
import type { AccountOrderDTO, AccountOverviewDTO, AccountStats } from "@/lib/dto";

function warrantyFor(slug: string | undefined): number {
  if (!slug) return 30;
  const found = catalog.find((p) => p.slug === slug);
  return found?.warrantyDays ?? 30;
}

function toAccountOrder(o: Order): AccountOrderDTO {
  let delivery: AccountOrderDTO["delivery"] = null;
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
    warrantyActive: o.status === "DELIVERED" && warrantyDays > 0 && warrantyEnds.getTime() > Date.now(),
    warrantyEndsAt: warrantyEnds.toISOString(),
    delivery,
  };
}

/** Customer dashboard overview: summary stats + order list for one email. */
export async function getAccountOverview(email: string): Promise<AccountOverviewDTO> {
  const safeEmail = email.toLowerCase().trim();

  const notConnected = (): AccountOverviewDTO => ({
    user: { email: safeEmail },
    stats: { totalOrders: 0, totalSpentBdt: 0, deliveredCount: 0, activeWarrantyCount: 0, lastOrderAt: null },
    orders: [],
  });

  if (!(await dbHealthy())) return notConnected();

  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, safeEmail))
      .orderBy(desc(orders.createdAt));

    const ordersDto = rows.map(toAccountOrder);

    let totalSpentBdt = 0;
    let deliveredCount = 0;
    let activeWarrantyCount = 0;
    let lastOrderAt: string | null = null;

    for (const o of ordersDto) {
      if (o.status === "PAID" || o.status === "DELIVERED") totalSpentBdt += Number(o.amountPaidBdt);
      if (o.status === "DELIVERED") deliveredCount++;
      if (o.warrantyActive) activeWarrantyCount++;
      if (!lastOrderAt) lastOrderAt = o.createdAt;
    }

    const stats: AccountStats = {
      totalOrders: ordersDto.length,
      totalSpentBdt,
      deliveredCount,
      activeWarrantyCount,
      lastOrderAt,
    };

    return { user: { email: safeEmail }, stats, orders: ordersDto };
  } catch {
    return notConnected();
  }
}
