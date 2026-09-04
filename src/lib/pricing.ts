/**
 * Uniform retail pricing policy.
 *
 * Every product carries the same gross margin: retail is derived from the
 * supplier's USD wholesale cost at a fixed exchange rate. The 70% margin was
 * chosen by matching Gemini Pro's retail price of ৳460 against its $1.10
 * wholesale cost:
 *
 *   retail BDT = wholesale USD × 125 (৳/$) ÷ (1 − 0.70) = wholesale × 416.67
 *
 * Static catalog entries and live ProdSeller products both use these helpers
 * so nothing drifts between sources.
 */

export const USD_TO_BDT = 125;
export const TARGET_MARGIN = 0.7;

/** Round a BDT retail price up to the nearest 10 (keeps prices clean). */
export function roundBdt(amount: number): number {
  return Math.max(Math.ceil(amount / 10) * 10, 10);
}

/** Retail price in BDT that yields exactly `TARGET_MARGIN` on a USD wholesale cost. */
export function retailPriceBdt(wholesaleCostUsd: number): number {
  return roundBdt((wholesaleCostUsd * USD_TO_BDT) / (1 - TARGET_MARGIN));
}

/** Equivalent retail price in USD (display only, at ৳125/$). */
export function retailPriceUsd(wholesaleCostUsd: number): number {
  return Math.round(wholesaleCostUsd / (1 - TARGET_MARGIN) * 100) / 100;
}

/** Gross margin percentage from USD retail vs wholesale cost. */
export function grossMarginPct(priceUsd: number, wholesaleCostUsd: number): number {
  if (priceUsd <= 0) return 0;
  return Math.round(((priceUsd - wholesaleCostUsd) / priceUsd) * 100);
}
