import type { Metadata } from "next";
import { dbHealthy } from "@/db";
import { requireUser } from "@/lib/session";
import { getDashboardOrders } from "@/lib/dashboard";
import { OrderCard } from "@/components/order-card";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "My Account",
  description: "Your Ai Biz BD orders, licenses and receipts.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  if (!(await dbHealthy())) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">
          My <span className="text-gradient">Account</span>
        </h1>
        <div className="glass-card mx-auto mt-8 max-w-md rounded-2xl p-8">
          <p className="text-sm text-[#8b93a7]">
            Your dashboard is starting up — connect the database and your orders will appear
            here. Check back in a moment.
          </p>
        </div>
      </div>
    );
  }

  const orders = await getDashboardOrders(user.email);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Customer dashboard
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold">
            My <span className="text-gradient">Account</span>
          </h1>
          <p className="mt-1 text-sm text-[#8b93a7]">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {orders.length === 0 ? (
        <div className="glass-card mt-10 rounded-2xl p-10 text-center">
          <h2 className="font-display text-xl font-bold">No orders yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#8b93a7]">
            Orders placed with {user.email} will show up here — with licenses, warranties and
            receipts.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-5">
          {orders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
