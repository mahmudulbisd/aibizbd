import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrderLookupForm } from "@/components/order-lookup-form";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.order.metaTitle,
    description: dict.order.metaDescription,
  };
}

export default async function OrderLookupPage() {
  const { dict } = await getI18n();

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        {dict.order.titleA} <span className="text-gradient">{dict.order.titleB}</span>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#8b93a7]">{dict.order.sub}</p>
      <OrderLookupForm />

      <div className="mt-10 border-t border-white/[0.06] pt-6">
        <p className="text-sm text-[#8b93a7]">{dict.order.haveAccount}</p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:underline"
        >
          {dict.order.signInToSee} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
