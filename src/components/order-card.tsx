"use client";

import { useState } from "react";
import { BadgeCheck, ChevronDown, Eye, EyeOff, Printer, ShieldAlert, ShieldCheck } from "lucide-react";
import type { DashboardOrder } from "@/lib/dashboard";
import { deliveryTypeLabel } from "@/lib/delivery";
import { formatBDT } from "@/lib/site";
import { CopyButton } from "@/components/copy-button";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending payment", cls: "badge-muted" },
  PAID: { label: "Paid — processing", cls: "badge-muted" },
  PROCESSING: { label: "Processing", cls: "badge-muted" },
  DELIVERED: { label: "Delivered", cls: "badge-instant" },
  FAILED: { label: "Failed", cls: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  REFUNDED: { label: "Refunded", cls: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
};

export function OrderCard({ order }: { order: DashboardOrder }) {
  const [revealed, setRevealed] = useState(false);
  const st = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING;
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[#5b6377]">{order.orderNumber}</p>
          <h3 className="font-display mt-1 font-bold">{order.productTitle}</h3>
          <p className="mt-0.5 text-xs text-[#8b93a7]">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · {order.paymentMethod.replace("_", " ")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
          <span className="font-display text-lg font-extrabold">{formatBDT(order.amountPaidBdt)}</span>
        </div>
      </div>

      {/* Warranty badge */}
      {isDelivered && (
        <div className="mt-3">
          {order.warrantyActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <ShieldCheck size={13} />
              {order.warrantyDays >= 365
                ? `${order.warrantyDays / 365 | 0}-year`
                : `${order.warrantyDays}-day`}{" "}
              replacement active · until{" "}
              {new Date(order.warrantyEndsAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#8b93a7]">
              <ShieldAlert size={13} />
              Warranty expired
            </span>
          )}
        </div>
      )}

      {/* Credential */}
      {isDelivered && order.delivery && (
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8b93a7]">
              {deliveryTypeLabel(order.delivery.type)}
            </span>
            <div className="flex items-center gap-2">
              {revealed && <CopyButton text={order.delivery.data} label="Copy" />}
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-[#aab3c5] transition hover:bg-cyan-500/15 hover:text-cyan-300"
              >
                {revealed ? (
                  <>
                    <EyeOff size={13} /> Hide
                  </>
                ) : (
                  <>
                    <Eye size={13} /> Reveal
                  </>
                )}
              </button>
            </div>
          </div>
          {revealed ? (
            <p className="mt-3 break-all font-mono text-sm leading-relaxed text-cyan-300">
              {order.delivery.data}
            </p>
          ) : (
            <p className="mt-3 font-mono text-sm text-[#4a5165]">••••••••••••••••••••</p>
          )}
          {revealed && order.delivery.instructions && order.delivery.instructions.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {order.delivery.instructions.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-[#aab3c5]">
                  <span className="font-mono text-cyan-400">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!isDelivered && (
        <p className="mt-4 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-[#8b93a7]">
          {order.status === "FAILED"
            ? "This order failed to fulfill. Contact WhatsApp support for a replacement or refund."
            : "Your credential will appear here automatically once delivery completes."}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <a
          href={`/order/${order.orderNumber}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-[#aab3c5] transition hover:text-cyan-300"
        >
          Open delivery page <ChevronDown size={13} className="rotate-270" />
        </a>
        <a
          href={`/order/${order.orderNumber}/receipt`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-[#aab3c5] transition hover:text-cyan-300"
        >
          <Printer size={13} /> Receipt
        </a>
        {isDelivered && (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-400">
            <BadgeCheck size={13} /> Verified delivery
          </span>
        )}
      </div>
    </div>
  );
}
