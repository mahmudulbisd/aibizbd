"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/locale-provider";

/** Button that "completes" the mock payment via a server-side route. */
export function MockGatewayClient({
  orderNumber,
  lookupSecret,
}: {
  orderNumber: string;
  lookupSecret: string;
}) {
  const router = useRouter();
  const { dict } = useI18n();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function completePayment() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/pay/${orderNumber}/complete`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? dict.checkout.errorGeneric);
        setState("idle");
        return;
      }
      setState("done");
      router.push(`/order/${orderNumber}?lookup=${lookupSecret}`);
    } catch {
      setError(dict.checkout.errorNetwork);
      setState("idle");
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={completePayment}
        disabled={state === "loading"}
        className="btn-neon w-full rounded-xl px-6 py-3.5 font-semibold text-white disabled:opacity-60"
      >
        {state === "loading"
          ? dict.checkout.creating
          : state === "done"
            ? "Paid ✓"
            : dict.checkout.submit}
      </button>
      {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
    </div>
  );
}
