import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { RevealScreen } from "@/components/reveal-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  description: "Track your Ai Biz BD order and unlock your delivery.",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ lookup?: string }>;
}) {
  const [{ orderNumber }, { lookup }] = await Promise.all([params, searchParams]);

  // Fail fast when the order number + secret don't exist yet.
  const order = await getOrderByNumber(orderNumber, lookup ?? undefined);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-[#5b6377]">
        Secure delivery node
      </p>
      <h1 className="font-display mt-2 text-center text-2xl font-bold sm:text-3xl">
        {order.orderNumber}
      </h1>
      <RevealScreen initialOrderNumber={order.orderNumber} lookupSecret={lookup ?? null} />
    </div>
  );
}
