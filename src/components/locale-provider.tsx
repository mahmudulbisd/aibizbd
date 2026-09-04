"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import {
  CURRENCY_COOKIE,
  LOCALE_COOKIE,
  type Currency,
  type Locale,
} from "@/lib/i18n/config";
import { formatDate, formatDateShort, formatDateTime, formatMoney, formatMoneyPair } from "@/lib/format";

interface I18nContextValue {
  locale: Locale;
  currency: Currency;
  dict: Dictionary;
  setLocale: (l: Locale) => void;
  setCurrency: (c: Currency) => void;
  /** Format a BDT amount in the current currency. */
  price: (bdt: string | number) => string;
  /** { primary, secondary } display pair for a storefront price. */
  pricePair: (bdt: string | number) => { primary: string; secondary: string };
  date: (iso: string | Date) => string;
  dateShort: (iso: string | Date) => string;
  dateTime: (iso: string | Date) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function setCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax${secure ? "; secure" : ""}`;
}

export function LocaleProvider({
  initialLocale,
  initialCurrency,
  children,
}: {
  initialLocale: Locale;
  initialCurrency: Currency;
  children: React.ReactNode;
}) {
  const router = useRouter();
  // Seeded from server props only — never read document.cookie during render.
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);
  const dict = getDictionary(locale);

  const setLocale = useCallback(
    (l: Locale) => {
      setCookie(LOCALE_COOKIE, l);
      setLocaleState(l);
      router.refresh();
    },
    [router],
  );

  const setCurrency = useCallback(
    (c: Currency) => {
      setCookie(CURRENCY_COOKIE, c);
      setCurrencyState(c);
      router.refresh();
    },
    [router],
  );

  const value: I18nContextValue = {
    locale,
    currency,
    dict,
    setLocale,
    setCurrency,
    price: useCallback((bdt) => formatMoney(bdt, currency), [currency]),
    pricePair: useCallback((bdt) => formatMoneyPair(bdt, currency), [currency]),
    date: useCallback((iso) => formatDate(iso, locale), [locale]),
    dateShort: useCallback((iso) => formatDateShort(iso, locale), [locale]),
    dateTime: useCallback((iso) => formatDateTime(iso, locale), [locale]),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <LocaleProvider>");
  return ctx;
}
