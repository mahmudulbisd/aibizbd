"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, ShieldCheck, X } from "lucide-react";
import { formatBDT } from "@/lib/site";
import type { CartItem } from "@/components/cart-context";

type PayMethod = "BKASH" | "NAGAD" | "BINANCE_PAY";

const PAY_METHODS: { id: PayMethod; label: string; note: string }[] = [
  { id: "BKASH", label: "bKash", note: "Personal / merchant" },
  { id: "NAGAD", label: "Nagad", note: "Personal / merchant" },
  { id: "BINANCE_PAY", label: "Binance Pay", note: "USDT / crypto" },
];

export function CheckoutDrawer({
  item,
  onClose,
}: {
  item: CartItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<PayMethod>("BKASH");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: item.slug,
          email,
          phone,
          paymentMethod: method,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(
          data.error === "INVALID_INPUT"
            ? "Please check your email and WhatsApp number."
            : data.error === "PRODUCT_NOT_FOUND"
              ? "That product is no longer available."
              : data.error === "DB_UNAVAILABLE"
                ? "Store is starting up — please try again in a moment."
                : "Something went wrong — please try again.",
        );
        setSubmitting(false);
        return;
      }
      const intent = data.intent as { paymentUrl?: string; orderNumber: string };
      if (intent.paymentUrl) {
        // Hosted/mock gateway: redirect there (it returns to the reveal page).
        router.push(intent.paymentUrl);
      } else {
        router.push(`/order/${intent.orderNumber}`);
      }
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-[#5b6377] outline-none transition focus:border-cyan-500/50 focus:bg-white/[0.05]";

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0a0d15] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Fast checkout
            </p>
            <p className="font-display mt-0.5 text-sm font-semibold text-white">
              {item.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="rounded-lg p-2 text-[#8b93a7] transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
            <span className="text-sm text-[#8b93a7]">Total</span>
            <span className="font-display text-xl font-extrabold text-white">
              {formatBDT(item.priceBdt)}
            </span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8b93a7]">
              Email (delivery)
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8b93a7]">
              WhatsApp number
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              className={inputCls}
              autoComplete="tel"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8b93a7]">
              Payment method
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`rounded-xl border px-2 py-3 text-center transition ${
                    method === m.id
                      ? "border-cyan-500/60 bg-cyan-500/10 text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-[#8b93a7] hover:border-white/[0.16]"
                  }`}
                >
                  <span className="block text-sm font-bold">{m.label}</span>
                  <span className="mt-0.5 block text-[10px] opacity-70">{m.note}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-6 py-4">
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn-neon flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Creating order…
              </>
            ) : (
              <>
                <CreditCard size={17} /> Pay &amp; Instant Unlock
              </>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#5b6377]">
            <ShieldCheck size={12} className="text-emerald-400" />
            Secure payment · Instant automated delivery · Replacement warranty
          </p>
        </div>
      </div>
    </div>
  );
}
