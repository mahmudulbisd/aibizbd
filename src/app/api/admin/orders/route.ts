import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, dbHealthy } from "@/db";
import { orders } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin";
import { encryptSecret } from "@/lib/crypto";

export async function PATCH(req: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await dbHealthy())) {
    return NextResponse.json({ error: "Database not reachable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { orderNumber, status, manualCredentials, manualInstructions, failureReason } = body;

    if (!orderNumber || typeof orderNumber !== "string") {
      return NextResponse.json({ error: "Missing orderNumber" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const current = existing[0];
    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
    }

    if (failureReason !== undefined) {
      updateData.failureReason = failureReason;
    }

    if (manualCredentials && typeof manualCredentials === "string") {
      let encrypted = manualCredentials.trim();
      try {
        encrypted = encryptSecret(manualCredentials.trim());
      } catch {
        // If encryption key is not set, store as is
      }

      updateData.deliveredDataEncrypted = encrypted;
      updateData.delivery = {
        type: current.productSnapshot?.deliveryType ?? "CREDENTIALS",
        data: manualCredentials.trim(),
        instructions: manualInstructions ? [manualInstructions.trim()] : ["Delivered by Ai Biz BD admin."],
      };
      updateData.status = "DELIVERED";
    }

    await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.orderNumber, orderNumber));

    return NextResponse.json({ ok: true, orderNumber });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
