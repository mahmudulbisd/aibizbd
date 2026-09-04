import type { OrderStatus, PaymentMethod, DeliveryType } from "./types";

/** Admin-facing order — safe for clients. Never contains secrets. */
export interface AdminOrderDTO {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  productTitle: string | null;
  productSlug: string | null;
  amountPaidBdt: string;
  paymentMethod: PaymentMethod;
  paymentTxId: string | null;
  status: OrderStatus;
  failureReason: string | null;
  deliveryType: DeliveryType | string;
  deliveryDataReady: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Customer-facing order — delivery decrypted only when DELIVERED + owner. */
export interface AccountOrderDTO {
  orderNumber: string;
  productTitle: string | null;
  amountPaidBdt: string;
  paymentMethod: string;
  status: OrderStatus | string;
  createdAt: string;
  warrantyDays: number;
  warrantyActive: boolean;
  warrantyEndsAt: string;
  delivery: { type: string; data: string; instructions?: string[] } | null;
}

export type AnalyticsRange = "7d" | "30d" | "all";

export interface AnalyticsKpis {
  revenueBdt: number;
  orders: number;
  paid: number;
  delivered: number;
  processing: number;
  pending: number;
  failed: number;
  refunded: number;
  needsAction: number;
}

export interface AnalyticsPoint {
  date: string;
  revenueBdt: number;
  orders: number;
}

export interface AdminAnalyticsDTO {
  range: AnalyticsRange;
  dbConnected: boolean;
  kpis: AnalyticsKpis;
  series: AnalyticsPoint[];
  statusSplit: { status: string; count: number }[];
  topProducts: { slug: string; title: string; orders: number; revenueBdt: number }[];
  paymentSplit: { method: string; orders: number; revenueBdt: number }[];
  recentOrders: AdminOrderDTO[];
}

export interface AccountStats {
  totalOrders: number;
  totalSpentBdt: number;
  deliveredCount: number;
  activeWarrantyCount: number;
  lastOrderAt: string | null;
}

export interface AccountOverviewDTO {
  user: { email: string };
  stats: AccountStats;
  orders: AccountOrderDTO[];
}

export function zeroAnalytics(range: AnalyticsRange): AdminAnalyticsDTO {
  return {
    range,
    dbConnected: false,
    kpis: {
      revenueBdt: 0,
      orders: 0,
      paid: 0,
      delivered: 0,
      processing: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
      needsAction: 0,
    },
    series: [],
    statusSplit: [],
    topProducts: [],
    paymentSplit: [],
    recentOrders: [],
  };
}
