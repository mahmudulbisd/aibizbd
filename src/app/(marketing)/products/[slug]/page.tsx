import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ShieldCheck, Timer, Zap, ArrowLeft } from "lucide-react";
import { getActiveProducts, getProductBySlug } from "@/lib/products";
import { formatBDT } from "@/lib/site";
import { deliveryTypeLabel } from "@/lib/delivery";
import { BuyButton } from "@/components/buy-button";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/#products"
        className="inline-flex items-center gap-1.5 text-sm text-[#8b93a7] transition hover:text-cyan-300"
      >
        <ArrowLeft size={15} /> All products
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        {/* ---- Info column ---- */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge-instant inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              <Zap size={12} className="fill-emerald-400/30" /> Instant delivery
            </span>
            <span className="badge-muted rounded-full px-3 py-1 text-xs font-medium">
              {deliveryTypeLabel(product.deliveryType)}
            </span>
          </div>

          <h1 className="font-display mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#8b93a7]">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              What&apos;s included
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-[#c3cad8]">
                  <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-emerald-400/10">
                    <Check size={11} className="text-emerald-400" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-5 text-sm text-[#8b93a7]">
            <span className="flex items-center gap-2">
              <Timer size={15} className="text-cyan-400" /> Delivered to your email + on-screen
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400" />
              {product.warrantyDays >= 365
                ? "1-year replacement warranty"
                : `${product.warrantyDays}-day replacement warranty`}
            </span>
          </div>
        </div>

        {/* ---- Purchase card ---- */}
        <div className="glass-card h-fit rounded-2xl p-6 lg:sticky lg:top-24">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-extrabold">
              {formatBDT(product.priceBdt)}
            </span>
            {product.priceUsd && (
              <span className="text-sm text-[#5b6377]">
                ≈ ${Number(product.priceUsd).toFixed(2)}
              </span>
            )}
          </div>

          <ul className="mt-5 space-y-2 text-sm text-[#aab3c5]">
            <li className="flex items-center gap-2">
              <Zap size={13} className="text-cyan-400" /> Instant automated delivery
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-emerald-400" /> Replacement guarantee
            </li>
            <li className="flex items-center gap-2">
              <Check size={13} className="text-violet-400" /> bKash · Nagad · Binance Pay
            </li>
          </ul>

          <div className="mt-6">
            <BuyButton product={product} />
          </div>

          <p className="mt-4 text-center text-xs text-[#5b6377]">
            No account needed. Credential delivered in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
