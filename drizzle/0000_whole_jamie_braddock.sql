CREATE TYPE "public"."delivery_type" AS ENUM('LINK', 'CREDENTIALS', 'ACTIVATION_KEY');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'PROCESSING', 'DELIVERED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('BKASH', 'NAGAD', 'ROCKET', 'BINANCE_PAY', 'CARD');--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('TELEGRAM_BOT_API', 'LOCAL_STOCK', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."supplier_action" AS ENUM('CHECK_BALANCE', 'PURCHASE', 'STOCK_SYNC');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"user_id" uuid,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"product_id" uuid,
	"product_snapshot" jsonb,
	"amount_paid_bdt" numeric(10, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_tx_id" text,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"delivered_data_encrypted" text,
	"delivery" jsonb,
	"supplier_order_id" text,
	"supplier_response_raw" jsonb,
	"lookup_secret" text,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price_bdt" numeric(10, 2) NOT NULL,
	"price_usd" numeric(10, 2),
	"wholesale_cost_usd" numeric(10, 2) NOT NULL,
	"provider_type" "provider_type" DEFAULT 'TELEGRAM_BOT_API' NOT NULL,
	"external_provider_id" text,
	"delivery_type" "delivery_type" DEFAULT 'LINK' NOT NULL,
	"warranty_days" integer DEFAULT 30 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "supplier_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_name" text DEFAULT 'ProdSeller' NOT NULL,
	"action" "supplier_action" NOT NULL,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"status_code" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "orders_tx_idx" ON "orders" USING btree ("payment_tx_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "supplier_logs_created_idx" ON "supplier_logs" USING btree ("created_at");