import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getAllAdminOrders } from "@/lib/admin-queries";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminOrdersClient } from "./admin-orders-client";

export const metadata: Metadata = {
  title: "Orders Manager — Ai Biz BD Admin",
  description: "View, filter, manage and manually fulfill customer orders.",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAllAdminOrders();

  return (
    <AdminShell activeTab="orders" orderCount={orders.length}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Orders <span className="text-gradient">Manager</span>
        </h1>
        <p className="mt-1 text-xs text-[#8b93a7]">
          Inspect live checkout transactions, verify payment hashes, update fulfillment status or manually send credentials.
        </p>
      </div>

      <AdminOrdersClient initialOrders={orders} />
    </AdminShell>
  );
}
