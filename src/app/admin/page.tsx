import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getAdminAnalytics } from "@/lib/queries/analytics";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { OverviewClient } from "@/components/admin/overview-client";

export const metadata: Metadata = {
  title: "Overview — Ai Biz BD Admin",
  description: "Real-time revenue analytics, order throughput and storefront health.",
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const initialData = await getAdminAnalytics("30d");

  return (
    <AdminShell activeTab="overview">
      <PageHeader
        eyebrow="Analytics"
        title="Overview"
        description="Revenue, orders and fulfillment at a glance."
      />
      <OverviewClient initialData={initialData} />
    </AdminShell>
  );
}
