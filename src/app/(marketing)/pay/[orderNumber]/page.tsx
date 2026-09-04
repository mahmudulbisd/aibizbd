import { redirect } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { formatMoney } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { MockGatewayClient } from "./mock-gateway-client";

export const dynamic = "force-dynamic";

/** Dev-only mock payment page. "Pay" fires the mock webhook and reveals the order. */
export default async function MockPayPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    redirect("/order?error=not_found");
  }

  const { dict } = await getI18n();

  return (
    <div className="bg-cyber min-h-[70vh]">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="glass-card rounded-2xl p-8">
          <p className="terminal-line text-xs">mock gateway // sandbox</p>
          <h1 className="font-display mt-3 text-2xl font-bold">Test payment</h1>
          <p className="mt-1 text-sm text-[#8b93a7]">
            {order.productSnapshot?.title} · {formatMoney(order.amountPaidBdt, "BDT")}
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between rounded-lg bg-white/[0.03] px-4 py-3">
              <span className="text-[#8b93a7]">{dict.order.orderShort}</span>
              <span className="font-mono">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-white/[0.03] px-4 py-3">
              <span className="text-[#8b93a7]">{dict.checkout.total}</span>
              <span className="font-semibold text-emerald-400">
                {formatMoney(order.amountPaidBdt, "BDT")}
              </span>
            </div>
          </div>
          <MockGatewayClient
            orderNumber={order.orderNumber}
            lookupSecret={order.lookupSecret ?? ""}
          />
          <p className="mt-4 text-center text-xs text-[#5b6377]">
            Dev sandbox — no real money moves.
          </p>
        </div>
      </div>
    </div>
  );
}
