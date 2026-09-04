import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { OrdersManagerClient } from "@/components/admin/orders-manager";

export const metadata: Metadata = {
  title: "Orders — Ai Biz BD Admin",
  description: "View, filter, manage and manually fulfill customer orders.",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();

  return (
    <AdminShell activeTab="orders">
      <PageHeader
        eyebrow="Operations"
        title="Orders"
        description="Inspect checkouts, verify payments, update fulfillment or deliver credentials manually."
      />
      <OrdersManagerClient />
    </AdminShell>
  );
}
