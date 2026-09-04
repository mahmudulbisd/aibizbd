import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrderLookupForm } from "@/components/order-lookup-form";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Look up your Ai Biz BD order and retrieve your delivered credentials.",
};

export default function OrderLookupPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Track your <span className="text-gradient">order</span>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#8b93a7]">
        Enter the order number from your confirmation email to see delivery status and recover
        your credential at any time.
      </p>
      <OrderLookupForm />

      <div className="mt-10 border-t border-white/[0.06] pt-6">
        <p className="text-sm text-[#8b93a7]">Have an account?</p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:underline"
        >
          Sign in to see all your orders <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
