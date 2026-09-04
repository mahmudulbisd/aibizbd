import { requireUser } from "@/lib/session";
import { AccountShell } from "@/components/account/account-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  return <AccountShell email={user.email}>{children}</AccountShell>;
}
