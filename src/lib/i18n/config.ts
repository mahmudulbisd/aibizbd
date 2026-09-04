/** Pure i18n/currency config — importable from middleware, server and client. */

export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const CURRENCIES = ["BDT", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const LOCALE_COOKIE = "aibizbd_locale";
export const CURRENCY_COOKIE = "aibizbd_currency";

export const DEFAULT_CURRENCY: Currency = "BDT";

/** Default when geo can't be determined (also overridable for local BD testing). */
export const DEFAULT_LOCALE: Locale =
  process.env.DEFAULT_LOCALE === "bn" ? "bn" : "en";

export function isLocale(v: unknown): v is Locale {
  return v === "bn" || v === "en";
}

export function isCurrency(v: unknown): v is Currency {
  return v === "BDT" || v === "USD";
}

/**
 * Geo → locale. Bangladeshi visitors get Bengali by default, everyone else
 * English. Mirrored by middleware AND getLocale() so the first paint is
 * correct even before the locale cookie round-trips.
 */
export function detectLocaleFromHeaders(headers: {
  get(name: string): string | null;
}): Locale {
  const country =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country");
  return country === "BD" ? "bn" : DEFAULT_LOCALE;
}

/** Bangladeshi phone → Bengali (used for email localization). */
export function localeFromPhone(phone: string | null | undefined): Locale {
  const digits = (phone ?? "").replace(/\D/g, "");
  return /^(?:88)?01[3-9]\d{8}$/.test(digits) ? "bn" : "en";
}
