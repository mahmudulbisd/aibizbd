"use client";

import { Languages, Coins } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import type { Currency, Locale } from "@/lib/i18n/config";

function Segment({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-md px-2 py-1 text-xs font-bold transition ${
              active
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-[#8b93a7] hover:text-white"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Compact combined language + currency switcher for the navbar. */
export function LocaleCurrencySwitcher({
  showCurrency = true,
}: {
  showCurrency?: boolean;
}) {
  const { locale, currency, setLocale, setCurrency, dict } = useI18n();

  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden text-faint lg:flex">
        <Languages className="h-3.5 w-3.5" />
      </span>
      <Segment
        ariaLabel={dict.currency.language}
        value={locale}
        onChange={(v) => setLocale(v as Locale)}
        options={[
          { value: "en", label: "EN" },
          { value: "bn", label: "বাং" },
        ]}
      />
      {showCurrency && (
        <>
          <span className="hidden text-faint lg:flex">
            <Coins className="h-3.5 w-3.5" />
          </span>
          <Segment
            ariaLabel={dict.currency.label}
            value={currency}
            onChange={(v) => setCurrency(v as Currency)}
            options={[
              { value: "BDT", label: "৳" },
              { value: "USD", label: "$" },
            ]}
          />
        </>
      )}
    </div>
  );
}
