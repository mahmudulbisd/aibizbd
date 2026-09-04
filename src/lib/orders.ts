import "server-only";
import { nanoid } from "nanoid";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getProductBySlug } from "@/lib/products";
import type { Order } from "@/db/schema";
import type { OrderStatus, PaymentMethod } from "@/lib/types";

export const checkoutSchema = z.object({
  productSlug: z.string().min(1),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{8,17}$/, "Enter a valid phone / WhatsApp number"),
  paymentMethod: z.enum(["BKASH", "NAGAD", "BINANCE_PAY"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const paymentTxSchema = z.object({
  /** Gateway transaction id, e.g. bKash trxID. */
  txId: z.string().min(1),
  /** Payment provider that verified the webhook. */
  provider: z.enum(["bkash", "binance", "mock"]),
  /** Verified amount paid in BDT (string, e.g. "299"). */
  amountBdt: z.string().min(1),
});

export type PaymentTx = z.infer<typeof paymentTxSchema>;

export function generateOrderNumber(): string {
  return `AIBIZ-${nanoid(8).toUpperCase()}`;
}

function publicStatus(s: Order["status"]) {
  return s as OrderStatus;
}

export async function createOrder(input: CheckoutInput): Promise<Order> {
  const product = await getProductBySlug(input.productSlug);
  if (!product || !product.isActive) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const rows = await db
    .insert(orders)
    .values({
      orderNumber: generateOrderNumber(),
      customerEmail: input.email.toLowerCase().trim(),
      customerPhone: input.phone.trim(),
      productId: product.id,
      productSnapshot: {
        title: product.title,
        slug: product.slug,
        priceBdt: String(product.priceBdt),
        deliveryType: product.deliveryType,
      },
      amountPaidBdt: String(product.priceBdt),
      paymentMethod: input.paymentMethod as PaymentMethod,
      lookupSecret: nanoid(32),
    })
    .returning();

  return rows[0];
}

/** Look up an order by order number. Optionally require the lookup secret (for revealing credentials). */
export async function getOrderByNumber(
  orderNumber: string,
  lookupSecret?: string,
): Promise<Order | null> {
  const conditions = [eq(orders.orderNumber, orderNumber)];
  if (lookupSecret) conditions.push(eq(orders.lookupSecret, lookupSecret));
  const rows = await db
    .select()
    .from(orders)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ?? null;
}

/** Orders placed with a given email, newest first (used by the customer dashboard). */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerEmail, email.toLowerCase().trim()))
    .orderBy(orders.createdAt);
  return rows.reverse();
}

export async function getOrderByPaymentTx(
  txId: string,
  provider: string,
): Promise<Order | null> {
  // tx ids are prefixed with the provider to avoid cross-gateway collisions.
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentTxId, `${provider}:${txId}`))
    .limit(1);
  return rows[0] ?? null;
}

export async function transitionOrder(
  orderNumber: string,
  from: OrderStatus[],
  to: OrderStatus,
  patch: Partial<{
    paymentTxId: string;
    supplierOrderId: string;
    failureReason: string;
  }> = {},
): Promise<Order | null> {
  const rows = await db
    .update(orders)
    .set({ status: to, ...patch })
    .where(
      and(
        eq(orders.orderNumber, orderNumber),
        from.length > 0 ? inArray(orders.status, from) : undefined,
      ),
    )
    .returning();
  return rows[0] ?? null;
}

export async function markDelivered(
  orderNumber: string,
  deliveryPayload: { type: string; data: string; instructions?: string[] },
  encryptedEnvelope: string,
  patch: Partial<{
    supplierOrderId: string;
    supplierResponseRaw: object;
  }> = {},
): Promise<void> {
  await db
    .update(orders)
    .set({
      status: "DELIVERED",
      deliveredDataEncrypted: encryptedEnvelope,
      delivery: deliveryPayload,
      ...patch,
    })
    .where(eq(orders.orderNumber, orderNumber));
}

export function orderStatusLabel(status: Order["status"]): OrderStatus {
  return publicStatus(status);
}
