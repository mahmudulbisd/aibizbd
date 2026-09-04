"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mail, MessageCircle, XCircle } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { CopyButton } from "@/components/copy-button";
import { useI18n } from "@/components/locale-provider";

type Delivery = { type: string; data: string; instructions?: string[] };

interface OrderStatus {
  orderNumber: string;
  status: string;
  productTitle: string | null;
  failureReason?: string | null;
  delivery: Delivery | null;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Scramble one character string into another (CSS-free, JS-driven). */
function scrambleInto(el: HTMLSpanElement, final: string) {
  const chars = "!<>-_\\/[]{}—=+*^?#0123456789ABCDEF";
  const steps = 6;
  let frame = 0;
  const timer = setInterval(() => {
    frame += 1;
    if (frame > steps) {
      el.textContent = final;
      clearInterval(timer);
      return;
    }
    el.textContent = final
      .split("")
      .map((c, i) => {
        if (c === " " || c === "/" || c === ":" || c === "." || c === "@") return c;
        if (frame >= steps || i > (final.length * frame) / steps) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");
  }, 70);
}

export function RevealScreen({
  initialOrderNumber,
  lookupSecret,
}: {
  initialOrderNumber: string;
  lookupSecret: string | null;
}) {
  const { dict } = useI18n();
  const [status, setStatus] = useState<string>("PENDING");
  const [productTitle, setProductTitle] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [phase, setPhase] = useState<"connect" | "processing" | "delivered" | "failed">("connect");
  const [error, setError] = useState<string | null>(null);
  const logLines = useRef<string[]>([
    dict.order.logConnect,
    dict.order.logHandshake,
  ]);

  const poll = useCallback(async () => {
    const q = lookupSecret ? `?lookup=${encodeURIComponent(lookupSecret)}` : "";
    const res = await fetch(`/api/orders/${initialOrderNumber}${q}`);
    if (!res.ok) {
      setStatus("UNKNOWN");
      return null;
    }
    const data = (await res.json()) as OrderStatus;
    setStatus(data.status);
    setProductTitle(data.productTitle);
    if (data.delivery) setDelivery(data.delivery);
    return data;
  }, [initialOrderNumber, lookupSecret]);

  // Terminal animation steps once we know the order exists.
  useEffect(() => {
    let cancelled = false;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;

    async function run() {
      setPhase("connect");
      const term = document.getElementById("term");
      if (term) term.innerHTML = "";
      for (const line of logLines.current) {
        if (cancelled) return;
        const el = document.getElementById("term");
        if (el) {
          const div = document.createElement("div");
          div.className = "terminal-line text-sm";
          div.textContent = line;
          el.appendChild(div);
        }
        await delay(650);
      }
      if (cancelled) return;
      setPhase("processing");
    }
    run();

    return () => {
      cancelled = true;
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, []);

  // Poll until DELIVERED / FAILED.
  const errorNotFound = dict.order.notFound;
  const errorFulfillment = dict.order.fulfillmentFailed;
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const data = await poll();
        if (cancelled) return;
        if (!data) {
          setPhase("failed");
          setError(errorNotFound);
          return;
        }
        if (data.status === "DELIVERED" && data.delivery) {
          setPhase("delivered");
          // Reveal with a short delay so the terminal reads naturally.
          setTimeout(() => {
            const el = document.getElementById("credential");
            if (el) scrambleInto(el, data.delivery!.data);
          }, 600);
          return;
        }
        if (data.status === "FAILED") {
          setPhase("failed");
          setError(data.failureReason ?? errorFulfillment);
          return;
        }
        // Still pending/processing — poll again.
        setTimeout(tick, 1600);
      } catch {
        if (!cancelled) setTimeout(tick, 2000);
      }
    }
    void tick();
    return () => {
      cancelled = true;
    };
  }, [poll, errorNotFound, errorFulfillment]);

  const delivered = phase === "delivered" && delivery;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      {/* Terminal card */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 font-mono text-xs text-[#5b6377]">
            {dict.order.terminalTitle}
          </span>
        </div>
        <div id="term" className="min-h-[150px] space-y-1.5 px-5 py-4" />

        {phase === "processing" && (
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 text-sm text-cyan-300">
              <Loader2 size={15} className="animate-spin" />
              {status === "PAID" || status === "PROCESSING"
                ? dict.order.processing1
                : dict.order.processing2}
            </div>
          </div>
        )}
      </div>

      {/* Delivered reveal */}
      {delivered && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <span className="font-semibold">{dict.order.delivered}</span>
          </div>
          <p className="mt-1 text-sm text-[#8b93a7]">{productTitle}</p>

          <div className="mt-5 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a7]">
                {dict.order.deliveryTypeLabel[delivery.type as keyof typeof dict.order.deliveryTypeLabel] ??
                  dict.common.digitalDelivery}
              </p>
              <CopyButton text={delivery.data} label={dict.common.copy} />
            </div>
            <p
              id="credential"
              className="mt-3 break-all font-mono text-[15px] leading-relaxed text-cyan-300"
            >
              {delivery.data}
            </p>
          </div>

          {delivery.instructions && delivery.instructions.length > 0 && (
            <ol className="mt-5 space-y-2">
              {delivery.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#aab3c5]">
                  <span className="font-mono text-xs text-cyan-400">0{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm text-[#8b93a7]">
              {dict.order.supportLost}{" "}
              <a
                href={siteConfig.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-cyan-300 hover:underline"
              >
                <MessageCircle size={13} /> {dict.order.whatsappSupport}
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Failed */}
      {phase === "failed" && (
        <div className="glass-card mt-6 rounded-2xl p-6 text-center">
          <XCircle className="mx-auto text-rose-400" size={28} />
          <h2 className="font-display mt-3 text-lg font-bold">{dict.order.notDelivered}</h2>
          <p className="mt-2 text-sm text-[#8b93a7]">
            {error ?? dict.order.failureNote}
          </p>
          <a
            href={siteConfig.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="btn-neon mx-auto mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
          >
            <MessageCircle size={15} /> {dict.order.contactWhatsapp}
          </a>
        </div>
      )}

      {/* Initial pending hint */}
      {phase === "connect" && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#5b6377]">
          <Mail size={12} /> {dict.order.pendingHint}
        </p>
      )}
    </div>
  );
}
