import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getAdminAnalytics } from "@/lib/queries/analytics";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { OverviewClient } from "@/components/admin/overview-client";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: `${dict.admin.overviewTitle} — Ai Biz BD Admin`,
    description: dict.admin.overviewSub,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [{ dict }, initialData] = await Promise.all([getI18n(), getAdminAnalytics("30d")]);

  return (
    <AdminShell activeTab="overview">
      <PageHeader
        eyebrow={dict.admin.overviewEyebrow}
        title={dict.admin.overviewTitle}
        description={dict.admin.overviewSub}
      />
      <OverviewClient initialData={initialData} />
    </AdminShell>
  );
}
