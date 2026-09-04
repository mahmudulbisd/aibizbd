import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import type { Product } from "@/db/schema";
import type { Dictionary } from "@/lib/i18n";
import type { Currency } from "@/lib/i18n/config";
import { formatMoneyPair } from "@/lib/format";
import { interpolate } from "@/lib/i18n";

export function ProductCard({
  product,
  dict,
  currency,
}: {
  product: Product;
  dict: Dictionary;
  currency: Currency;
}) {
  const { primary, secondary } = formatMoneyPair(product.priceBdt, currency);
  const warranty =
    product.warrantyDays >= 365
      ? dict.common.warrantyYear
      : interpolate(dict.common.warrantyDays, { days: product.warrantyDays });

  return (
    <Link
      href={`/products/${product.slug}`}
      className="glass-card glass-card-hover group flex flex-col rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="badge-instant inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
          <Zap size={11} className="fill-emerald-400/30" />
          {dict.common.instant}
        </span>
        <span className="badge-muted rounded-full px-2.5 py-1 text-[11px] font-medium">
          {dict.deliveryType[product.deliveryType as keyof typeof dict.deliveryType] ??
            dict.common.digitalDelivery}
        </span>
      </div>

      <h3 className="font-display mt-4 text-lg font-bold leading-snug transition group-hover:text-cyan-300">
        {product.title}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[#8b93a7]">
        {product.description}
      </p>

      <div className="mt-5 flex items-end justify-between border-t border-white/[0.06] pt-4">
        <div>
          <div className="font-display text-2xl font-extrabold text-white">{primary}</div>
          <div className="text-xs text-[#5b6377]">{secondary}</div>
        </div>
        <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-semibold text-cyan-300 transition group-hover:bg-cyan-500/10">
          {dict.common.buyNow}
          <ArrowRight size={13} />
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#5b6377]">
        <ShieldCheck size={12} className="text-emerald-400" />
        {warranty}
      </div>
    </Link>
  );
}
