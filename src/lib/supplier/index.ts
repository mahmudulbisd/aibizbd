import "server-only";
import type { FulfillmentProviderName, DeliveryPayload } from "@/lib/types";

export interface SupplierStock {
  inStock: boolean;
  quantity: number;
}

export interface SupplierPurchaseResult {
  ok: boolean;
  supplierOrderId?: string;
  delivery?: DeliveryPayload;
  remainingBalance?: number;
  error?: string;
}

export interface SupplierClient {
  checkStock(productId: string): Promise<SupplierStock>;
  createPurchase(input: {
    productId: string;
    quantity: number;
    reference: string;
    /** Product's delivery category — lets the supplier resolve a raw key correctly. */
    deliveryType?: string;
  }): Promise<SupplierPurchaseResult>;
  getBalance(): Promise<number>;
}

/** Choose the supplier client from FULFILLMENT_PROVIDER (default: mock). */
export async function getSupplierClient(): Promise<SupplierClient> {
  const chosen = (process.env.FULFILLMENT_PROVIDER ?? "mock") as FulfillmentProviderName;
  switch (chosen) {
    case "prodseller": {
      const { ProdSellerClient } = await import("./prodseller");
      return new ProdSellerClient();
    }
    case "mock":
    default: {
      const { MockSupplierClient } = await import("./mock");
      return new MockSupplierClient();
    }
  }
}
