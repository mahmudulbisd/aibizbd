import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { getAccountOverview } from "@/lib/queries/account";
import { AccountOverviewClient } from "@/components/account/account-overview-client";

export const metadata: Metadata = {
  title: "My Account",
  description: "Your Ai Biz BD orders, licenses and receipts.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getAccountOverview(user.email);

  return <AccountOverviewClient email={user.email} initialData={data} />;
}
