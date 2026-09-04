"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";

export function OrderLookupForm() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = orderNumber.trim().toUpperCase();
    if (!value) {
      setError("Enter your order number.");
      return;
    }
    if (!/^AIBIZ-/.test(value)) {
      setError("Order numbers start with AIBIZ- (check your email).");
      return;
    }
    router.push(`/order/${value}`);
  }

  return (
    <form onSubmit={submit} className="mt-8">
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#8b93a7]">
        Order number
      </label>
      <div className="mt-2 flex gap-2">
        <input
          value={orderNumber}
          onChange={(e) => {
            setOrderNumber(e.target.value);
            setError(null);
          }}
          placeholder="AIBIZ-XXXXXXXX"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 font-mono text-sm text-white placeholder-[#5b6377] outline-none transition focus:border-cyan-500/50"
        />
        <button
          type="submit"
          className="btn-neon flex-none rounded-xl px-6 py-3 font-semibold text-white"
        >
          Track
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      <p className="mt-4 flex items-center gap-2 text-xs text-[#5b6377]">
        <PackageSearch size={13} />
        We emailed your order number after purchase. Credentials appear here once the order is
        delivered.
      </p>
    </form>
  );
}
