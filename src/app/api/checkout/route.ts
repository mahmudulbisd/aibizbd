import { NextResponse } from "next/server";
import { dbHealthy } from "@/db";
import { checkoutSchema, createOrder } from "@/lib/orders";
import { createCheckoutIntent } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Graceful guard: without a configured database we cannot create an order.
    if (!(await dbHealthy())) {
      return NextResponse.json(
        { error: "DB_UNAVAILABLE", message: "Store is starting up. Try again shortly." },
        { status: 503 },
      );
    }

    const order = await createOrder(parsed.data);
    const intent = await createCheckoutIntent(order);

    return NextResponse.json({ ok: true, intent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    if (message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }
    console.error("checkout failed:", err);
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
