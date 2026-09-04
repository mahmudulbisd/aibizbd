export type DeliveryType = "LINK" | "CREDENTIALS" | "ACTIVATION_KEY";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "DELIVERED"
  | "FAILED"
  | "REFUNDED";

export type PaymentMethod =
  | "BKASH"
  | "NAGAD"
  | "ROCKET"
  | "BINANCE_PAY"
  | "CARD";

export type PaymentProviderName = "mock" | "bkash" | "binance";
export type FulfillmentProviderName = "mock" | "prodseller";

export interface DeliveryPayload {
  type: DeliveryType;
  data: string;
  instructions?: string[];
}

export interface CheckoutIntent {
  /** Gateway redirect URL for hosted flows (bkash/binance/mock). */
  paymentUrl?: string;
  /** Client token / QR payload for inline flows. */
  clientToken?: string;
  /** The order number the reveal page polls. */
  orderNumber: string;
  provider: PaymentProviderName;
}
