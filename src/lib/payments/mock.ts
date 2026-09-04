import "server-only";
import type { PaymentProvider } from "./index";
import type { Order } from "@/db/schema";

const MOCK_SECRET = process.env.MOCK_PAYMENT_SECRET ?? "dev-mock-secret-change-me";

/**
 * Dev-only payment provider. Creates a fake "pay" URL (rendered as a local
 * mock-gateway page) and accepts a webhook signed with MOCK_PAYMENT_SECRET.
 * This lets the whole checkout → delivery flow run with no external accounts.
 */
export class MockPaymentProvider implements PaymentProvider {
  name = "mock" as const;

  async createPayment(order: Order) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return {
      paymentUrl: `${base}/pay/${order.orderNumber}`,
    };
  }

  async verifyWebhook(req: Request) {
    try {
      const body = await req.json();
      if (body?.secret !== MOCK_SECRET) return { verified: false as const };
      if (body?.status !== "PAID") return { verified: false as const };
      if (!body?.orderNumber || !body?.txId) return { verified: false as const };
      return {
        verified: true as const,
        orderNumber: String(body.orderNumber),
        txId: String(body.txId),
        amountBdt: String(body.amountBdt ?? "0"),
      };
    } catch {
      return { verified: false as const };
    }
  }

  txId(_orderNumber: string, txId: string) {
    return `mock:${txId}`;
  }
}
