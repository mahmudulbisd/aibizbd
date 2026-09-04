import "server-only";
import { z } from "zod";
import { db } from "@/db";
import { supplierLogs } from "@/db/schema";
import type { SupplierClient, SupplierPurchaseResult, SupplierStock } from "./index";

/**
 * Real ProdSeller v1 API client — per the official spec (PRD §8).
 *
 *   Base URL:   https://prodseller.com/v1
 *   Auth:       X-API-Key: psk_...   (NOT Bearer)
 *   Idempotency: Idempotency-Key header on POST /orders prevents duplicate
 *               charges when a request is retried.
 *   Rate limit: 300 req / 15 min (X-RateLimit-* headers).
 *
 * Order flow: POST /orders { productId, quantity }  →
 *   { orderId, status: "delivered", deliveredKey: "email:pass" }
 */

const balanceSchema = z.object({
  telegramId: z.number().optional(),
  balance: z.number(),
  membership: z.string().optional(),
});

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  publicPrice: z.number().optional(),
  imageUrl: z.string().nullable().optional(),
  inStock: z.boolean().optional(),
  stock: z.number().nullable().optional(),
});

const orderResponseSchema = z.object({
  orderId: z.string(),
  status: z.enum(["pending", "paid", "delivered", "failed"]),
  product: z
    .object({ id: z.string(), name: z.string() })
    .optional()
    .default({ id: "", name: "" }),
  quantity: z.number().optional(),
  amount: z.number().optional(),
  deliveredKey: z.string().optional(),
  deliveredKeys: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  error: z.string().optional(),
});

const BASE_URL = process.env.PRODSELLER_API_URL || "https://prodseller.com/v1";

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-Key": process.env.PRODSELLER_API_KEY ?? "",
    ...extra,
  };
}

function resolveDelivery(data: string, type: string): { type: "LINK" | "CREDENTIALS" | "ACTIVATION_KEY"; data: string } {
  // Data shape gives a hint: "email:pass" or "user/pass" → CREDENTIALS,
  // a bare invite/activation URL → LINK, otherwise treat as the requested type.
  if (/^[\w.+=-]+@[\w.-]+:(?!\/\/).+/.test(data) || /^[\w.+=-]+\/[\w@./-]+$/.test(data)) {
    return { type: "CREDENTIALS", data };
  }
  if (/^https?:\/\//.test(data)) {
    return type === "ACTIVATION_KEY" ? { type: "ACTIVATION_KEY", data } : { type: "LINK", data };
  }
  return { type: (type as "LINK" | "CREDENTIALS" | "ACTIVATION_KEY") ?? "CREDENTIALS", data };
}

async function log(
  action: "CHECK_BALANCE" | "PURCHASE" | "STOCK_SYNC",
  req: unknown,
  res: unknown,
  statusCode?: number,
) {
  try {
    await db.insert(supplierLogs).values({
      supplierName: "ProdSeller",
      action,
      requestPayload: req as object,
      responsePayload: res as object,
      statusCode,
    });
  } catch (err) {
    console.error("supplier_log write failed:", err);
  }
}

export class ProdSellerClient implements SupplierClient {
  /** GET /v1/balance — live USDT balance + VIP tier. */
  async getBalance(): Promise<number> {
    try {
      const res = await fetch(`${BASE_URL}/balance`, {
        headers: headers(),
        signal: AbortSignal.timeout(5000),
      });
      const json = await res.json().catch(() => ({}));
      await log("CHECK_BALANCE", {}, json, res.status);
      const parsed = balanceSchema.parse(json);
      return parsed.balance;
    } catch (err) {
      await log("CHECK_BALANCE", {}, { error: String(err) });
      return -1;
    }
  }

  /** GET /v1/products — list active products and wholesale rates. */
  async getProducts() {
    const res = await fetch(`${BASE_URL}/products`, {
      headers: headers(),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json().catch(() => ({}));
    await log("STOCK_SYNC", {}, json, res.status);
    if (!res.ok) throw new Error(`ProdSeller GET /products failed: ${res.status}`);
    const list = Array.isArray(json) ? json : (json as { products?: unknown }).products ?? [];
    return z.array(productSchema).parse(list);
  }

  /** GET /v1/products/:id — check single product stock. */
  async checkStock(productId: string): Promise<SupplierStock> {
    try {
      const res = await fetch(`${BASE_URL}/products/${encodeURIComponent(productId)}`, {
        headers: headers(),
        signal: AbortSignal.timeout(5000),
      });
      const json = await res.json().catch(() => ({}));
      await log("STOCK_SYNC", { productId }, json, res.status);
      const parsed = productSchema.parse(json);
      return {
        inStock: parsed.inStock ?? (parsed.stock ?? 0) > 0,
        quantity: parsed.stock ?? 0,
      };
    } catch (err) {
      await log("STOCK_SYNC", { productId }, { error: String(err) });
      return { inStock: false, quantity: 0 };
    }
  }

  /**
   * POST /v1/orders — deduct balance & deliver instantly.
   * Uses the order number as the Idempotency-Key so a retry can never double-charge.
   */
  async createPurchase(input: {
    productId: string;
    quantity: number;
    reference: string;
    deliveryType?: string;
  }): Promise<SupplierPurchaseResult> {
    const body = {
      productId: input.productId,
      quantity: input.quantity,
    };
    const idemKey = input.reference; // e.g. AIBIZ-XXXXXX — unique per order
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: headers({ "Idempotency-Key": idemKey }),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      const json = await res.json().catch(() => ({}));
      await log("PURCHASE", { ...body, idempotencyKey: idemKey }, json, res.status);

      if (!res.ok) {
        const msg =
          (json as { error?: string }).error ?? `ProdSeller POST /orders failed: ${res.status}`;
        return { ok: false, error: msg };
      }

      const parsed = orderResponseSchema.parse(json);
      if (parsed.status !== "delivered") {
        return {
          ok: false,
          error: parsed.error ?? `Order not delivered (status: ${parsed.status})`,
          supplierOrderId: parsed.orderId,
        };
      }

      const rawKey = parsed.deliveredKey ?? parsed.deliveredKeys?.[0];
      if (!rawKey) {
        return {
          ok: false,
          error: "No deliveredKey in supplier response",
          supplierOrderId: parsed.orderId,
        };
      }

      return {
        ok: true,
        supplierOrderId: parsed.orderId,
        delivery: resolveDelivery(rawKey, input.deliveryType ?? "CREDENTIALS"),
        remainingBalance: undefined, // balance not returned by POST /orders; call GET /balance
      };
    } catch (err) {
      await log("PURCHASE", body, { error: String(err) });
      return { ok: false, error: String(err) };
    }
  }

  /** GET /v1/orders/:id — verify the status of a previous order. */
  async getOrder(orderId: string) {
    const res = await fetch(`${BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      headers: headers(),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json().catch(() => ({}));
    await log("PURCHASE", { orderId }, json, res.status);
    if (!res.ok) throw new Error(`ProdSeller GET /orders/:id failed: ${res.status}`);
    return orderResponseSchema.parse(json);
  }
}
