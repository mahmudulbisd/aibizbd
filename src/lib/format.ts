import { USD_TO_BDT } from "@/lib/pricing";
import type { Currency, Locale } from "./i18n/config";

/** Bengali month names — Latin digits are used for the day/year. */
const BN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const BN_MONTHS_SHORT = [
  "জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন",
  "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে",
];
const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const EN_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function group(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/**
 * Format a BDT amount in the given currency. BDT is canonical: USD is a live
 * display conversion at the fixed store rate (priceBdt ÷ 125). Always uses
 * Latin digits (modern BD e-commerce style).
 */
export function formatMoney(amountBdt: string | number, currency: Currency): string {
  const bdt = Number(amountBdt ?? 0);
  if (currency === "USD") {
    const usd = bdt / USD_TO_BDT;
    return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `৳${group(bdt)}`;
}

/**
 * Primary + secondary display pair for a storefront price, e.g.
 * BDT → { primary: "৳2,710", secondary: "≈ $21.68" }
 * USD → { primary: "$21.68", secondary: "≈ ৳2,710" }
 */
export function formatMoneyPair(
  amountBdt: string | number,
  currency: Currency,
): { primary: string; secondary: string } {
  const main = formatMoney(amountBdt, currency);
  const other = formatMoney(amountBdt, currency === "USD" ? "BDT" : "USD");
  return {
    primary: main,
    secondary: `≈ ${other}`,
  };
}

/** "12 জানুয়ারি 2026" | "12 January 2026" — Bengali month, Latin digits. */
export function formatDate(iso: string | Date, locale: Locale): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  const months = locale === "bn" ? BN_MONTHS : EN_MONTHS;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** "12 জানু 2026" | "12 Jan 2026" — short month form. */
export function formatDateShort(iso: string | Date, locale: Locale): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  const months = locale === "bn" ? BN_MONTHS_SHORT : EN_MONTHS_SHORT;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** "12 জানু 2026, 3:45 PM" — date + time (used in admin tables). */
export function formatDateTime(iso: string | Date, locale: Locale): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  const date = formatDateShort(iso, locale);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date}, ${time}`;
}

/** Latin digits, en-IN grouping: 1234567 → "12,34,567". */
export function formatNumber(n: number): string {
  return group(n);
}
