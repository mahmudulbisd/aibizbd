import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dev-only: "complete" a mock payment. Constructs the same payload the mock
 * gateway would deliver to /api/webhooks/payment and POSTs it server-side so
 * MOCK_PAYMENT_SECRET never reaches the browser.
 */
export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/pay/[orderNumber]/complete">,
) {
  const { orderNumber } = await ctx.params;
  const secret = process.env.MOCK_PAYMENT_SECRET ?? "dev-mock-secret-change-me";

  // Load the order to read the real amount server-side (never trust the client).
  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookRes = await fetch(`${base}/api/webhooks/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      status: "PAID",
      orderNumber,
      txId: `MOCKTX-${Date.now()}`,
      amountBdt: order.amountPaidBdt,
    }),
  });
  const data = await webhookRes.json().catch(() => ({}));
  if (!webhookRes.ok || !data.ok) {
    return NextResponse.json(
      { error: data.error ?? "WEBHOOK_FAILED" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderNumber,
    revealUrl: `/order/${orderNumber}?lookup=${order.lookupSecret ?? ""}`,
  });
}
