import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { getCurrentUser } from "@/lib/session";
import { formatBDT, siteConfig } from "@/lib/site";
import { Receipt } from "@/components/receipt";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receipt",
  description: "Order receipt",
};

function deliveryTypeLabel(type?: string): string {
  switch (type) {
    case "LINK":
      return "Invite link";
    case "CREDENTIALS":
      return "Credentials";
    case "ACTIVATION_KEY":
      return "Activation key";
    default:
      return "Digital delivery";
  }
}

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ lookup?: string }>;
}) {
  const [{ orderNumber }, { lookup }] = await Promise.all([params, searchParams]);
  const user = await getCurrentUser();

  // Authorize: session email matches, or the buyer's lookup secret is present.
  const order = await getOrderByNumber(orderNumber, lookup ?? undefined);
  const authorizedBySession = user && order && order.customerEmail === user.email;
  if (!order || !(authorizedBySession || lookup)) notFound();

  const amount = Number(order.amountPaidBdt);
  const status = order.status;

  return (
    <Receipt
      orderNumber={order.orderNumber}
      productTitle={order.productSnapshot?.title ?? "Digital product"}
      description={order.productSnapshot?.slug ?? ""}
      deliveryType={deliveryTypeLabel(order.delivery?.type)}
      amountBdt={amount}
      amountFormatted={formatBDT(order.amountPaidBdt)}
      paidVia={order.paymentMethod.replace("_", " ")}
      status={status}
      date={order.createdAt}
      email={order.customerEmail}
      brandName={siteConfig.name}
      supportWhatsApp={siteConfig.supportWhatsApp}
    />
  );
}
