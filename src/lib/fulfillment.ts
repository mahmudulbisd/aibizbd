import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { getSupplierClient } from "@/lib/supplier";
import { encryptSecret } from "@/lib/crypto";
import { sendDeliveryEmail } from "@/lib/email";
import { notifyAdmin } from "@/lib/telegram";
import { formatMoney } from "@/lib/format";
import { localeFromPhone } from "@/lib/i18n/config";
import { markDelivered, transitionOrder } from "@/lib/orders";

/**
 * The digital fulfillment engine.
 *
 * Called after a payment webhook flips an order to PAID. Loads the order +
 * product, purchases from the supplier adapter, encrypts the delivered
 * credential at rest, and fans out delivery (email) + admin alert (Telegram).
 *
 * All supplier calls are logged to supplier_logs by the client itself.
 */
export async function fulfillOrder(orderNumber: string): Promise<void> {
  const [orderRow] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  if (!orderRow) throw new Error(`order ${orderNumber} not found`);
  if (orderRow.status !== "PAID") {
    // Already delivered/failed/refunded — never double-purchase.
    return;
  }

  // Mark PROCESSING so a concurrent webhook replay doesn't re-enter.
  const processing = await transitionOrder(orderNumber, ["PAID"], "PROCESSING");
  if (!processing) return;

  // Resolve the supplier's product id + delivery type from the catalog.
  let supplierProductId: string | null = null;
  let deliveryType: string | null = null;
  if (orderRow.productId) {
    const [prod] = await db
      .select({
        externalProviderId: products.externalProviderId,
        deliveryType: products.deliveryType,
      })
      .from(products)
      .where(eq(products.id, orderRow.productId))
      .limit(1);
    supplierProductId = prod?.externalProviderId ?? null;
    deliveryType = prod?.deliveryType ?? null;
  }

  try {
    const supplier = await getSupplierClient();
    const purchase = await supplier.createPurchase({
      productId: supplierProductId ?? orderRow.productId ?? "unknown",
      quantity: 1,
      reference: orderRow.orderNumber,
      deliveryType: deliveryType ?? undefined,
    });

    if (!purchase.ok || !purchase.delivery) {
      await transitionOrder(orderNumber, ["PROCESSING"], "FAILED", {
        failureReason: purchase.error ?? "SUPPLIER_FAILED",
      });
      await notifyAdmin(
        `🔴 <b>Order Failed — ${orderRow.orderNumber}</b>\n` +
          `📦 ${orderRow.productSnapshot?.title ?? "Unknown product"}\n` +
          `👤 ${orderRow.customerEmail}\n` +
          `⚠️ ${purchase.error ?? "Supplier error"}`,
      );
      return;
    }

    // Encrypt the credential at rest before writing anything.
    const envelope = encryptSecret(purchase.delivery.data);
    await markDelivered(orderNumber, purchase.delivery, envelope, {
      supplierOrderId: purchase.supplierOrderId,
      supplierResponseRaw: purchase.supplierOrderId
        ? { orderId: purchase.supplierOrderId, remainingBalance: purchase.remainingBalance }
        : undefined,
    });

    // Fan out side effects (best-effort, non-blocking).
    const emailP = sendDeliveryEmail({
      to: orderRow.customerEmail,
      orderNumber: orderRow.orderNumber,
      productTitle: orderRow.productSnapshot?.title ?? "Your product",
      delivery: purchase.delivery,
      locale: localeFromPhone(orderRow.customerPhone),
    }).catch((err) => console.error("delivery email failed:", err));

    const balanceNote =
      purchase.remainingBalance !== undefined
        ? `💰 Supplier balance left: $${purchase.remainingBalance.toFixed(2)}`
        : "";
    const alertP = notifyAdmin(
      `🟢 <b>New Order Delivered!</b>\n` +
        `📦 ${orderRow.productSnapshot?.title ?? "Digital product"}\n` +
        `🧾 ${orderRow.orderNumber}\n` +
        `💵 Paid: ${formatMoney(orderRow.amountPaidBdt, "BDT")} · ${orderRow.paymentMethod}\n` +
        `👤 ${orderRow.customerEmail} (${orderRow.customerPhone})\n` +
        balanceNote,
    ).catch((err) => console.error("telegram alert failed:", err));

    await Promise.allSettled([emailP, alertP]);
  } catch (err) {
    console.error(`fulfillment crashed for ${orderNumber}:`, err);
    await transitionOrder(orderNumber, ["PROCESSING"], "FAILED", {
      failureReason: err instanceof Error ? err.message : "UNKNOWN",
    });
  }
}
