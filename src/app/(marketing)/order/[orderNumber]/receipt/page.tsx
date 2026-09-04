import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { getCurrentUser } from "@/lib/session";
import { siteConfig } from "@/lib/site";
import { getI18n } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/format";
import { Receipt } from "@/components/receipt";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.receipt.metaTitle,
    description: dict.receipt.metaDescription,
  };
}

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ lookup?: string }>;
}) {
  const [{ orderNumber }, { lookup }] = await Promise.all([params, searchParams]);
  const [user, { dict, locale }] = await Promise.all([getCurrentUser(), getI18n()]);

  // Authorize: session email matches, or the buyer's lookup secret is present.
  const order = await getOrderByNumber(orderNumber, lookup ?? undefined);
  const authorizedBySession = user && order && order.customerEmail === user.email;
  if (!order || !(authorizedBySession || lookup)) notFound();

  const amount = Number(order.amountPaidBdt);
  const status = order.status;
  // Receipts are transactional records of the BDT amount actually paid.
  const amountFormatted = formatMoney(order.amountPaidBdt, "BDT");
  const deliveryTypeKey =
    (order.delivery?.type as keyof typeof dict.deliveryType) ?? "CREDENTIALS";

  return (
    <Receipt
      orderNumber={order.orderNumber}
      productTitle={order.productSnapshot?.title ?? dict.common.digitalDelivery}
      description={order.productSnapshot?.slug ?? ""}
      deliveryType={dict.deliveryType[deliveryTypeKey] ?? dict.common.digitalDelivery}
      amountBdt={amount}
      amountFormatted={amountFormatted}
      paidVia={dict.payment[order.paymentMethod as keyof typeof dict.payment] ?? order.paymentMethod}
      status={status}
      date={order.createdAt}
      email={order.customerEmail}
      brandName={siteConfig.name}
      supportWhatsApp={siteConfig.supportWhatsApp}
      locale={locale}
    />
  );
}
