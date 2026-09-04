import "server-only";
import type { PaymentProviderName, CheckoutIntent } from "@/lib/types";
import type { Order } from "@/db/schema";

export interface PaymentProvider {
  name: PaymentProviderName;
  /**
   * Initialize payment for an order. Returns a redirect URL and/or client token.
   * The order row already exists in PENDING state before this is called.
   */
  createPayment(order: Order): Promise<{ paymentUrl?: string; clientToken?: string }>;
  /**
   * Verify an incoming payment webhook request body + headers.
   * On success returns the verified gateway transaction id, the verified BDT
   * amount as a string, and the merchant order reference (order number) when
   * the gateway echoes it. Must never trust client-supplied amounts.
   */
  verifyWebhook(
    req: Request,
  ): Promise<
    | { verified: true; txId: string; amountBdt: string; orderNumber?: string }
    | { verified: false }
  >;
  /**
   * After verification, build the order's payment_tx_id column value.
   */
  txId(orderNumber: string, txId: string): string;
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  const chosen = (process.env.PAYMENT_PROVIDER ?? "mock") as PaymentProviderName;
  switch (chosen) {
    case "bkash": {
      const { BkashProvider } = await import("./bkash");
      return new BkashProvider();
    }
    case "binance": {
      const { BinanceProvider } = await import("./binance");
      return new BinanceProvider();
    }
    case "mock":
    default: {
      const { MockPaymentProvider } = await import("./mock");
      return new MockPaymentProvider();
    }
  }
}

export function paymentProviderName(): PaymentProviderName {
  return (process.env.PAYMENT_PROVIDER ?? "mock") as PaymentProviderName;
}

export async function createCheckoutIntent(order: Order): Promise<CheckoutIntent> {
  const provider = await getPaymentProvider();
  const { paymentUrl, clientToken } = await provider.createPayment(order);
  return {
    orderNumber: order.orderNumber,
    provider: provider.name,
    paymentUrl,
    clientToken,
  };
}
