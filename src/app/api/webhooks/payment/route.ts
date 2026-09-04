import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { getOrderByNumber, getOrderByPaymentTx, transitionOrder } from "@/lib/orders";
import { fulfillOrder } from "@/lib/fulfillment";

export const runtime = "nodejs";

/**
 * Shared payment webhook/callback receiver.
 * Verifies the signature via the configured provider, is idempotent by
 * payment_tx_id, and hands off to the fulfillment engine.
 */
export async function POST(req: Request) {
  const provider = await getPaymentProvider();
  const result = await provider.verifyWebhook(req);
  if (!result.verified) {
    return NextResponse.json({ error: "VERIFICATION_FAILED" }, { status: 400 });
  }

  // Resolve the order: prefer the merchant order reference echoed by the
  // gateway, then fall back to the tx-id index (idempotent replay path).
  let order =
    (result.orderNumber && (await getOrderByNumber(result.orderNumber))) ?? null;
  if (!order) {
    order = await getOrderByPaymentTx(result.txId, provider.name);
  }

  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  // Amount guard: never trust a client amount; compare to the order total.
  if (Number(result.amountBdt) !== Number(order.amountPaidBdt)) {
    console.error(
      `webhook amount mismatch for ${order.orderNumber}: got ${result.amountBdt}, expected ${order.amountPaidBdt}`,
    );
    return NextResponse.json({ error: "AMOUNT_MISMATCH" }, { status: 400 });
  }

  // Idempotency: only PENDING orders transition to PAID. Replays of an
  // already-paid webhook are a successful no-op.
  const paid = await transitionOrder(
    order.orderNumber,
    ["PENDING"],
    "PAID",
    { paymentTxId: provider.txId(order.orderNumber, result.txId) },
  );
  if (!paid) {
    return NextResponse.json({ ok: true, status: order.status });
  }

  // Fire the fulfillment engine without blocking the webhook response.
  void fulfillOrder(paid.orderNumber).catch((err) => {
    console.error(`fulfillment failed for ${paid.orderNumber}:`, err);
  });

  return NextResponse.json({ ok: true, status: "PAID" });
}

/**
 * bKash tokenized checkout returns the customer via browser redirect (GET) to
 * this URL. We verify + execute server-side, then send them to the reveal page.
 */
export async function GET(req: Request) {
  const provider = await getPaymentProvider();
  const result = await provider.verifyWebhook(req);
  if (!result.verified) {
    return NextResponse.redirect(new URL("/order?error=payment_failed", req.url));
  }

  let order =
    (result.orderNumber && (await getOrderByNumber(result.orderNumber))) ?? null;
  if (!order) {
    order = await getOrderByPaymentTx(result.txId, provider.name);
  }
  if (!order) {
    return NextResponse.redirect(new URL("/order?error=not_found", req.url));
  }

  const paid = await transitionOrder(
    order.orderNumber,
    ["PENDING"],
    "PAID",
    { paymentTxId: provider.txId(order.orderNumber, result.txId) },
  );
  if (paid) {
    void fulfillOrder(paid.orderNumber).catch((err) => {
      console.error(`fulfillment failed for ${paid.orderNumber}:`, err);
    });
  }

  return NextResponse.redirect(
    new URL(`/order/${order.orderNumber}?lookup=${order.lookupSecret ?? ""}`, req.url),
  );
}
