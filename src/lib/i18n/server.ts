import "server-only";
import { cookies, headers } from "next/headers";
import { getDictionary, type Dictionary } from ".";
import {
  CURRENCY_COOKIE,
  LOCALE_COOKIE,
  detectLocaleFromHeaders,
  isCurrency,
  isLocale,
  type Currency,
  type Locale,
} from "./config";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  // First paint before the middleware cookie round-trips — mirror the geo rule.
  return detectLocaleFromHeaders(await headers());
}

export async function getCurrency(): Promise<Currency> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CURRENCY_COOKIE)?.value;
  return isCurrency(cookie) ? cookie : "BDT";
}

export async function getI18n(): Promise<{
  locale: Locale;
  currency: Currency;
  dict: Dictionary;
}> {
  const locale = await getLocale();
  const currency = await getCurrency();
  return { locale, currency, dict: getDictionary(locale) };
}
