import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { OrdersManagerClient } from "@/components/admin/orders-manager";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: `${dict.admin.ordersTitle} — Ai Biz BD Admin`,
    description: dict.admin.ordersSub,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const { dict } = await getI18n();

  return (
    <AdminShell activeTab="orders">
      <PageHeader
        eyebrow={dict.admin.ordersEyebrow}
        title={dict.admin.ordersTitle}
        description={dict.admin.ordersSub}
      />
      <OrdersManagerClient />
    </AdminShell>
  );
}
