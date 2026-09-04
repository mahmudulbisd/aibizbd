import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";
import { decryptSecret } from "@/lib/crypto";

export const runtime = "nodejs";

/**
 * Order status + reveal endpoint.
 * Public: returns status/order metadata only.
 * With ?lookup=<secret>: additionally returns the decrypted credential once
 * the order is DELIVERED. The secret is only shown to the buyer at checkout,
 * so the credential is never exposed to someone who only knows the order id.
 */
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/orders/[orderNumber]">,
) {
  const { orderNumber } = await ctx.params;
  const url = new URL(_req.url);
  const lookupSecret = url.searchParams.get("lookup");

  const order = await getOrderByNumber(orderNumber, lookupSecret ?? undefined);
  if (!order) {
    // Without a valid secret we 404 (never leak order existence).
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const canReveal =
    lookupSecret &&
    order.lookupSecret === lookupSecret &&
    order.status === "DELIVERED" &&
    order.deliveredDataEncrypted &&
    order.delivery;

  let delivery: unknown = null;
  if (canReveal) {
    try {
      const plaintext = decryptSecret(order.deliveredDataEncrypted!);
      delivery = { ...order.delivery, data: plaintext };
    } catch {
      delivery = { ...order.delivery, data: null };
    }
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    productTitle: order.productSnapshot?.title ?? null,
    amountPaidBdt: order.amountPaidBdt,
    paymentMethod: order.paymentMethod,
    failureReason: order.failureReason ?? null,
    email: order.customerEmail,
    delivery,
  });
}
