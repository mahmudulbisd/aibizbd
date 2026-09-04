"use client";

import { Zap } from "lucide-react";
import type { Product } from "@/db/schema";
import { useCart } from "@/components/cart-context";
import { useI18n } from "@/components/locale-provider";

export function BuyButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { dict } = useI18n();

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="btn-neon flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-white"
    >
      <Zap size={17} className="fill-white/20" />
      {dict.product.buyNow}
    </button>
  );
}
