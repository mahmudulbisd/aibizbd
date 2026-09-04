import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import type { Product } from "@/db/schema";
import { formatBDT } from "@/lib/site";
import { deliveryTypeLabel } from "@/lib/delivery";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="glass-card glass-card-hover group flex flex-col rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="badge-instant inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
          <Zap size={11} className="fill-emerald-400/30" />
          Instant
        </span>
        <span className="badge-muted rounded-full px-2.5 py-1 text-[11px] font-medium">
          {deliveryTypeLabel(product.deliveryType)}
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
          <div className="font-display text-2xl font-extrabold text-white">
            {formatBDT(product.priceBdt)}
          </div>
          {product.priceUsd && (
            <div className="text-xs text-[#5b6377]">
              ≈ ${Number(product.priceUsd).toFixed(2)} USD
            </div>
          )}
        </div>
        <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-semibold text-cyan-300 transition group-hover:bg-cyan-500/10">
          Buy now <ArrowRight size={13} />
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#5b6377]">
        <ShieldCheck size={12} className="text-emerald-400" />
        {product.warrantyDays >= 365
          ? "1-year replacement warranty"
          : `${product.warrantyDays}-day replacement warranty`}
      </div>
    </Link>
  );
}
