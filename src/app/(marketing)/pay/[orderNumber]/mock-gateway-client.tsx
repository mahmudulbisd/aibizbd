"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Button that "completes" the mock payment via a server-side route. */
export function MockGatewayClient({
  orderNumber,
  lookupSecret,
}: {
  orderNumber: string;
  lookupSecret: string;
}) {
  const router = useRouter();
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
        setError(data.error ?? "Payment could not be completed.");
        setState("idle");
        return;
      }
      setState("done");
      router.push(`/order/${orderNumber}?lookup=${lookupSecret}`);
    } catch {
      setError("Network error — please try again.");
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
          ? "Confirming payment…"
          : state === "done"
            ? "Paid ✓"
            : "Pay now (mock)"}
      </button>
      {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
    </div>
  );
}
