import "server-only";
import crypto from "node:crypto";
import type { PaymentProvider } from "./index";
import type { Order } from "@/db/schema";

/**
 * Binance Pay merchant integration.
 * Docs: open a merchant order -> POST /binancepay/openapi/v2/order
 * Webhook signature: HMAC SHA256 over the raw body with the merchant secret.
 */
export class BinanceProvider implements PaymentProvider {
  name = "binance" as const;

  private baseUrl(): string {
    return process.env.BINANCE_PAY_API_URL ?? "https://bpay.binanceapi.com";
  }

  private signature(payload: string, timestamp: string): string {
    const secret = process.env.BINANCE_PAY_API_SECRET ?? "";
    return crypto
      .createHmac("sha256", secret)
      .update(timestamp + "\n" + payload)
      .digest("hex");
  }

  private headers() {
    const apiKey = process.env.BINANCE_PAY_API_KEY ?? "";
    const timestamp = Date.now().toString();
    return {
      "content-type": "application/json",
      "BinancePay-Timestamp": timestamp,
      "BinancePay-Nonce": crypto.randomUUID(),
      "BinancePay-Certificate-SN": apiKey,
      "BinancePay-Signature": this.signature("", timestamp),
    };
  }

  async createPayment(order: Order) {
    if (!process.env.BINANCE_PAY_API_KEY || !process.env.BINANCE_PAY_API_SECRET) {
      throw new Error("Binance Pay credentials are not configured.");
    }
    const body = {
      env: { terminalType: "WEB" },
      merchantTradeNo: order.orderNumber,
      orderAmount: String(order.amountPaidBdt),
      currency: "BDT",
      goods: {
        goodsType: "01",
        goodsCategory: "D000",
        referenceGoodsId: order.productSnapshot?.slug ?? "",
        goodsName: order.productSnapshot?.title ?? "Digital product",
        goodsDetail: order.productSnapshot?.title ?? "Digital product",
      },
    };
    const res = await fetch(`${this.baseUrl()}/binancepay/openapi/v2/order`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Binance create failed: ${res.status}`);
    const data = await res.json();
    if (data?.status !== "SUCCESS" || !data?.data) {
      throw new Error(`Binance create rejected: ${data?.errorMessage ?? "unknown"}`);
    }
    return { clientToken: data.data.qrContent as string };
  }

  async verifyWebhook(req: Request) {
    try {
      const raw = await req.text();
      const timestamp = req.headers.get("BinancePay-Timestamp") ?? "";
      const signature = req.headers.get("BinancePay-Signature") ?? "";
      const expected = this.signature(raw, timestamp);
      // Timing-safe compare of the webhook signature.
      const a = Buffer.from(signature);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return { verified: false as const };
      }
      const data = JSON.parse(raw);
      const biz = data?.bizStatus;
      const status = data?.status;
      if (biz !== "PAY_SUCCESS" && status !== "SUCCESS") {
        return { verified: false as const };
      }
      return {
        verified: true as const,
        txId: String(data?.data?.tradeNo ?? data?.data?.merchantTradeNo ?? "unknown"),
        amountBdt: String(data?.data?.totalFee ?? "0"),
        orderNumber: String(data?.data?.merchantTradeNo ?? ""),
      };
    } catch {
      return { verified: false as const };
    }
  }

  txId(_orderNumber: string, txId: string) {
    return `binance:${txId}`;
  }
}
