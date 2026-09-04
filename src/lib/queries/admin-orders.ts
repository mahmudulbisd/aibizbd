import "server-only";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, dbHealthy } from "@/db";
import { orders } from "@/db/schema";
import type { Order } from "@/db/schema";
import type { AdminOrderDTO } from "@/lib/dto";
import type { OrderStatus } from "@/lib/types";

export function toAdminOrderDTO(o: Order): AdminOrderDTO {
  const created = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
  const updated = o.updatedAt instanceof Date ? o.updatedAt : new Date(o.updatedAt);
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    productTitle: o.productSnapshot?.title ?? null,
    productSlug: o.productSnapshot?.slug ?? null,
    amountPaidBdt: String(o.amountPaidBdt),
    paymentMethod: o.paymentMethod,
    paymentTxId: o.paymentTxId,
    status: o.status,
    failureReason: o.failureReason,
    deliveryType: o.productSnapshot?.deliveryType ?? "CREDENTIALS",
    deliveryDataReady: Boolean(o.delivery?.data),
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString(),
  };
}

export interface AdminOrderListParams {
  search?: string;
  status?: OrderStatus | "ALL";
  page?: number;
  pageSize?: number;
}

export interface AdminOrderListResult {
  items: AdminOrderDTO[];
  total: number;
  page: number;
  pageSize: number;
}

const empty = (page = 1, pageSize = 50): AdminOrderListResult => ({
  items: [],
  total: 0,
  page,
  pageSize,
});

export async function listAdminOrders(params: AdminOrderListParams = {}): Promise<AdminOrderListResult> {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 50, 1), 200);

  if (!(await dbHealthy())) return empty(page, pageSize);

  try {
    const q = params.search?.trim().toLowerCase();
    const conditions = [];

    if (q) {
      const pattern = `%${q}%`;
      conditions.push(
        or(
          ilike(orders.orderNumber, pattern),
          ilike(orders.customerEmail, pattern),
          ilike(orders.customerPhone, pattern),
          ilike(orders.paymentTxId, pattern),
          ilike(sql`${orders.productSnapshot}->>'title'`, pattern),
        ),
      );
    }

    if (params.status && params.status !== "ALL") {
      conditions.push(eq(orders.status, params.status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(where);

    const rows = await db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      items: rows.map(toAdminOrderDTO),
      total: Number(count ?? 0),
      page,
      pageSize,
    };
  } catch {
    return empty(page, pageSize);
  }
}
