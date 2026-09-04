import "server-only";
import type { SupplierClient, SupplierPurchaseResult, SupplierStock } from "./index";

const FAKE_DELIVERY: Record<
  "LINK" | "CREDENTIALS" | "ACTIVATION_KEY",
  { type: "LINK" | "CREDENTIALS" | "ACTIVATION_KEY"; data: string; instructions: string[] }
> = {
  LINK: {
    type: "LINK",
    data: "https://accounts.google.com/activate?invite=MOCK-XXXX-XXXX-XXXX",
    instructions: [
      "Open the link in a browser while signed in to your own Google account.",
      "Click Accept invitation. Your subscription activates instantly.",
    ],
  },
  CREDENTIALS: {
    type: "CREDENTIALS",
    data: "demo@aibizbd.test / AiBizDemo2026!",
    instructions: [
      "Open the app and sign in with the credentials above.",
      "Do not change the password — message support if you need it changed.",
    ],
  },
  ACTIVATION_KEY: {
    type: "ACTIVATION_KEY",
    data: "AIBIZ-XXXX-XXXX-XXXX-XXXX",
    instructions: [
      "Open the product's activation page and paste the key.",
      "The key activates on one device only.",
    ],
  },
};

/**
 * Default dev supplier. Simulates the ProdSeller v1 flow (stock check →
 * purchase → delivered key) with canned data so the whole pipeline runs with
 * no external API. The payload is chosen from the product's delivery type.
 * Set FAIL_MOCK_SUPPLIER=1 to exercise the failure path.
 */
export class MockSupplierClient implements SupplierClient {
  private latency(): Promise<void> {
    return new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
  }

  private async maybeFail(): Promise<boolean> {
    if (process.env.FAIL_MOCK_SUPPLIER === "1") {
      await this.latency();
      return true;
    }
    return false;
  }

  async checkStock(productId: string): Promise<SupplierStock> {
    await this.latency();
    void productId;
    return { inStock: true, quantity: 42 };
  }

  async createPurchase(input: {
    productId: string;
    quantity: number;
    reference: string;
    deliveryType?: string;
  }): Promise<SupplierPurchaseResult> {
    await this.latency();
    if (await this.maybeFail()) {
      return { ok: false, error: "SUPPLIER_OUT_OF_BALANCE" };
    }
    const template =
      FAKE_DELIVERY[(input.deliveryType as keyof typeof FAKE_DELIVERY) ?? "CREDENTIALS"] ??
      FAKE_DELIVERY.CREDENTIALS;
    return {
      ok: true,
      supplierOrderId: `MOCK-${Math.floor(Math.random() * 1e6)}`,
      delivery: { ...template },
      remainingBalance: 48.8,
    };
  }

  async getBalance(): Promise<number> {
    return 48.8;
  }
}
