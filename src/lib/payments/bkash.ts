import "server-only";
import type { PaymentProvider } from "./index";
import type { Order } from "@/db/schema";

/**
 * bKash tokenized checkout — sandbox first.
 * Requires BKASH_SANDBOX_* env vars. Implementation is built to the public
 * bKash tokenized-checkout (v1.2.0-beta sandbox) flow:
 *   1. grant token  -> POST /tokenized/checkout/token/grant
 *   2. create       -> POST /tokenized/checkout/create
 *   3. webhook       -> POST /tokenized/checkout/execute (server-side confirm)
 * Verify keys/URLs against your live merchant dashboard before enabling.
 */
export class BkashProvider implements PaymentProvider {
  name = "bkash" as const;

  private baseUrl(): string {
    return (
      process.env.BKASH_SANDBOX_BASE_URL ?? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    );
  }

  private async grantToken(): Promise<string> {
    const res = await fetch(`${this.baseUrl()}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_key: process.env.BKASH_SANDBOX_APP_KEY,
        app_secret: process.env.BKASH_SANDBOX_APP_SECRET,
      }),
    });
    if (!res.ok) throw new Error(`bKash token grant failed: ${res.status}`);
    const data = await res.json();
    if (data?.statusCode !== "0000" || !data?.id_token) {
      throw new Error(`bKash token grant rejected: ${data?.statusMessage ?? "unknown"}`);
    }
    return data.id_token as string;
  }

  async createPayment(order: Order) {
    const appKey = process.env.BKASH_SANDBOX_APP_KEY;
    const appSecret = process.env.BKASH_SANDBOX_APP_SECRET;
    if (!appKey || !appSecret || !process.env.BKASH_SANDBOX_MERCHANT_ID) {
      throw new Error("bKash sandbox credentials are not configured.");
    }
    const token = await this.grantToken();
    const res = await fetch(`${this.baseUrl()}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "X-APP-Key": appKey,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: order.customerPhone,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/payment`,
        amount: String(order.amountPaidBdt),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: order.orderNumber,
      }),
    });
    if (!res.ok) throw new Error(`bKash create failed: ${res.status}`);
    const data = await res.json();
    if (data?.statusCode !== "0000" || !data?.bkashURL) {
      throw new Error(`bKash create rejected: ${data?.statusMessage ?? "unknown"}`);
    }
    return { paymentUrl: data.bkashURL as string };
  }

  async verifyWebhook(req: Request) {
    // In the tokenized flow, bKash redirects the customer back to the
    // callbackURL with ?paymentID=...&status=success. The merchant then calls
    // executePayment to confirm server-side before treating it as paid.
    try {
      const url = new URL(req.url);
      const paymentId = url.searchParams.get("paymentID");
      const status = url.searchParams.get("status");
      if (!paymentId || status !== "success") return { verified: false as const };

      const token = await this.grantToken();
      const appKey = process.env.BKASH_SANDBOX_APP_KEY;
      const res = await fetch(`${this.baseUrl()}/tokenized/checkout/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": appKey ?? "",
        },
        body: JSON.stringify({ paymentID: paymentId }),
      });
      const data = await res.json();
      if (data?.statusCode !== "0000" || data?.transactionStatus !== "Completed") {
        return { verified: false as const };
      }
      return {
        verified: true as const,
        txId: String(data.trxID),
        amountBdt: String(data.amount),
        orderNumber: String(data.merchantInvoiceNumber),
      };
    } catch {
      return { verified: false as const };
    }
  }

  txId(_orderNumber: string, txId: string) {
    return `bkash:${txId}`;
  }
}
