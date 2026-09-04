// End-to-end integration test for the order → payment → fulfillment → reveal
// pipeline, run against an in-memory Postgres (PGlite). Requires a Postgres-
// compatible schema; pg-mem is not used because Drizzle's node-postgres driver
// needs a real wire protocol.
//
// Run: npx tsx scripts/test-flow.ts
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { __setTestDb, __resetTestDb } from "../src/db";
import {
  products as productsTable,
  orders as ordersTable,
} from "../src/db/schema";
import { getProductBySlug, getActiveProducts } from "../src/lib/products";
import { createOrder, getOrderByNumber, transitionOrder } from "../src/lib/orders";
import { fulfillOrder } from "../src/lib/fulfillment";
import { decryptSecret } from "../src/lib/crypto";
import { retailPriceBdt, retailPriceUsd } from "../src/lib/pricing";

async function applyMigration(client: PGlite) {
  const sql = fs.readFileSync(
    path.join(__dirname, "..", "drizzle", "0000_whole_jamie_braddock.sql"),
    "utf8",
  );
  for (const stmt of sql.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean)) {
    await client.exec(stmt);
  }
}

async function seedProduct(client: PGlite) {
  const db = drizzlePglite(client, { schema: { products: productsTable } });
  await db.insert(productsTable).values({
    slug: "gemini-pro-18-months",
    title: "Gemini Pro — 18 Months",
    description: "Integration test product",
    features: ["Gemini Advanced access", "5TB storage"],
    // Mirrors the uniform 70%-margin pricing policy (see src/lib/pricing.ts).
    priceBdt: String(retailPriceBdt(1.1)),
    priceUsd: String(retailPriceUsd(1.1)),
    wholesaleCostUsd: "1.1",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a31035939dc014325da2c66",
    deliveryType: "LINK",
    warrantyDays: 540,
    isActive: true,
  });
}

let failures = 0;
function assert(cond: unknown, msg: string) {
  if (!cond) {
    failures += 1;
    console.error(`  ✗ ${msg}`);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

async function main() {
  console.log("Starting integration test…");

  const client = new PGlite();
  const db = drizzlePglite(client, { schema: { products: productsTable, orders: ordersTable } });
  await applyMigration(client);
  await seedProduct(client);

  // Swap the app-wide db to this in-memory instance.
  __setTestDb(db as never);
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  process.env.FULFILLMENT_PROVIDER = "mock";

  try {
    // 1. Catalog available.
    const products = await getActiveProducts();
    assert(products.length === 1, "catalog has 1 active product");
    const product = await getProductBySlug("gemini-pro-18-months");
    assert(!!product, "product found by slug");

    // 2. Create an order (PENDING).
    const order = await createOrder({
      productSlug: "gemini-pro-18-months",
      email: "customer@example.com",
      phone: "+8801711000000",
      paymentMethod: "BKASH",
    });
    assert(order.orderNumber.startsWith("AIBIZ-"), "order number generated");
    assert(order.status === "PENDING", "order starts PENDING");
    assert(order.lookupSecret && order.lookupSecret.length > 10, "lookup secret generated");
    assert(Number(order.amountPaidBdt) === retailPriceBdt(1.1), "amount stored from product");

    // 3. Payment webhook effect: transition to PAID + record tx.
    const paid = await transitionOrder(order.orderNumber, ["PENDING"], "PAID", {
      paymentTxId: `mock:MOCKTX-123`,
    });
    assert(!!paid && paid.status === "PAID", "order transitions to PAID on webhook");

    // 4. Replay idempotency: a second transition from PENDING should no-op.
    const replay = await transitionOrder(order.orderNumber, ["PENDING"], "PAID");
    assert(replay === null, "duplicate webhook replay is a no-op");

    // 5. Fulfillment runs against the mock supplier and delivers.
    await fulfillOrder(order.orderNumber);
    const delivered = await getOrderByNumber(order.orderNumber);
    assert(delivered?.status === "DELIVERED", "order reaches DELIVERED");
    assert(!!delivered?.supplierOrderId, "supplier order id recorded");
    assert(!!delivered?.delivery, "delivery payload recorded");
    assert(delivered?.delivery?.type === "LINK", "delivery type LINK for this product");
    assert(
      !!delivered?.deliveredDataEncrypted &&
        delivered.deliveredDataEncrypted.startsWith("v1."),
      "credential stored as encrypted envelope",
    );
    const plaintext = decryptSecret(delivered!.deliveredDataEncrypted!);
    assert(plaintext.includes("accounts.google.com"), "decrypted credential matches supplier data");

    // 6. Supplier logs are written by the real ProdSeller client; the mock
    //    supplier exercises the same path without logging. Verify the order
    //    carried the supplier reference instead.
    assert(!!delivered?.supplierResponseRaw, "supplier response raw recorded");
    const raw = await client.query<{ delivered_data_encrypted: string }>(
      `SELECT delivered_data_encrypted FROM orders WHERE order_number = $1`,
      [order.orderNumber],
    );
    const env = raw.rows[0].delivered_data_encrypted;
    assert(!env.includes("accounts.google.com"), "DB stores only ciphertext, never the link");
  } catch (err) {
    failures += 1;
    console.error("  ✗ unexpected error:", err);
  } finally {
    __resetTestDb();
    await client.close();
  }

  if (failures > 0) {
    console.error(`\n${failures} assertion(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll assertions passed ✓");
  process.exit(0);
}

void main();
