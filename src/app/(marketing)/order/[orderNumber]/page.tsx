import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { RevealScreen } from "@/components/reveal-screen";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.order.secureNode,
    description: dict.order.metaDescription,
  };
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ lookup?: string }>;
}) {
  const [{ orderNumber }, { lookup }] = await Promise.all([params, searchParams]);
  const { dict } = await getI18n();

  // Fail fast when the order number + secret don't exist yet.
  const order = await getOrderByNumber(orderNumber, lookup ?? undefined);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-[#5b6377]">
        {dict.order.secureNode}
      </p>
      <h1 className="font-display mt-2 text-center text-2xl font-bold sm:text-3xl">
        {order.orderNumber}
      </h1>
      <RevealScreen initialOrderNumber={order.orderNumber} lookupSecret={lookup ?? null} />
    </div>
  );
}
