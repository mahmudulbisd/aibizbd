import { pgTable, uuid, text, numeric, boolean, integer, jsonb, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";

/* ---------- Enums ---------- */
export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "PROCESSING",
  "DELIVERED",
  "FAILED",
  "REFUNDED",
]);

export const paymentMethod = pgEnum("payment_method", [
  "BKASH",
  "NAGAD",
  "ROCKET",
  "BINANCE_PAY",
  "CARD",
]);

export const providerType = pgEnum("provider_type", [
  "TELEGRAM_BOT_API",
  "LOCAL_STOCK",
  "MANUAL",
]);

export const supplierAction = pgEnum("supplier_action", [
  "CHECK_BALANCE",
  "PURCHASE",
  "STOCK_SYNC",
]);

export const deliveryType = pgEnum("delivery_type", [
  "LINK",
  "CREDENTIALS",
  "ACTIVATION_KEY",
]);

/* ---------- Users (optional auth; supports guest checkout) ---------- */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Categories & products ---------- */
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    priceBdt: numeric("price_bdt", { precision: 10, scale: 2 }).notNull(),
    priceUsd: numeric("price_usd", { precision: 10, scale: 2 }),
    wholesaleCostUsd: numeric("wholesale_cost_usd", { precision: 10, scale: 2 }).notNull(),
    providerType: providerType("provider_type").notNull().default("TELEGRAM_BOT_API"),
    externalProviderId: text("external_provider_id"),
    deliveryType: deliveryType("delivery_type").notNull().default("LINK"),
    warrantyDays: integer("warranty_days").notNull().default(30),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_active_idx").on(t.isActive),
  ],
);

/* ---------- Orders ---------- */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    productId: uuid("product_id").references(() => products.id),
    productSnapshot: jsonb("product_snapshot").$type<{
      title: string;
      slug: string;
      priceBdt: string;
      deliveryType: string;
    }>(),
    amountPaidBdt: numeric("amount_paid_bdt", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentTxId: text("payment_tx_id"),
    status: orderStatus("status").notNull().default("PENDING"),
    deliveredDataEncrypted: text("delivered_data_encrypted"),
    delivery: jsonb("delivery").$type<{
      type: string;
      data: string;
      instructions?: string[];
    }>(),
    supplierOrderId: text("supplier_order_id"),
    supplierResponseRaw: jsonb("supplier_response_raw"),
    lookupSecret: text("lookup_secret"),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("orders_order_number_idx").on(t.orderNumber),
    index("orders_email_idx").on(t.customerEmail),
    index("orders_tx_idx").on(t.paymentTxId),
    index("orders_status_idx").on(t.status),
  ],
);

/* ---------- Supplier balance & API logs ---------- */
export const supplierLogs = pgTable(
  "supplier_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierName: text("supplier_name").notNull().default("ProdSeller"),
    action: supplierAction("action").notNull(),
    requestPayload: jsonb("request_payload"),
    responsePayload: jsonb("response_payload"),
    statusCode: integer("status_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("supplier_logs_created_idx").on(t.createdAt)],
);

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type SupplierLog = typeof supplierLogs.$inferSelect;
