"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";

/** Clean, printable invoice. "Download" renders the current DOM via print-to-PDF. */
export function Receipt(props: {
  orderNumber: string;
  productTitle: string;
  description: string;
  deliveryType: string;
  amountBdt: number;
  amountFormatted: string;
  paidVia: string;
  status: string;
  date: Date | string;
  email: string;
  brandName: string;
  supportWhatsApp: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const statusLabel =
    props.status === "DELIVERED"
      ? "Paid & delivered"
      : props.status === "PAID" || props.status === "PROCESSING"
        ? "Paid"
        : props.status;

  function print() {
    setDownloading(true);
    // Let the state flush, then print (user saves as PDF).
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 50);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Receipt</h1>
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={print}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-[#aab3c5] transition hover:text-cyan-300"
          >
            {downloading ? "Preparing…" : (
              <>
                <Download size={15} /> PDF
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-[#aab3c5] transition hover:text-cyan-300"
          >
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* Invoice card */}
      <div
        id="receipt"
        className="glass-card rounded-2xl bg-white p-8 text-zinc-900 print:bg-white print:shadow-none"
      >
        <div className="flex items-start justify-between border-b border-zinc-200 pb-5">
          <div>
            <p className="text-xl font-extrabold tracking-tight">{props.brandName}</p>
            <p className="mt-1 text-xs text-zinc-500">Digital delivery receipt</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono text-xs text-zinc-500">{props.orderNumber}</p>
            <p className="mt-1 font-semibold">{statusLabel}</p>
            <p className="text-xs text-zinc-500">
              {new Date(props.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
              <th className="pb-2 font-semibold">Item</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100">
              <td className="py-3">
                <p className="font-semibold text-zinc-800">{props.productTitle}</p>
                <p className="text-xs text-zinc-500">
                  {props.deliveryType} · delivered to {props.email}
                </p>
              </td>
              <td className="py-3 text-right font-semibold">{props.amountFormatted}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-3 text-xs uppercase tracking-wide text-zinc-400">
                Paid via {props.paidVia}
              </td>
              <td className="py-3 text-right">
                <span className="font-display text-lg font-extrabold">{props.amountFormatted}</span>
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
          <p>
            {props.brandName} · Bogra, Bangladesh · WhatsApp {props.supportWhatsApp}
          </p>
          <p className="mt-1">
            Keep this receipt for warranty claims. Questions? Reply to your delivery email.
          </p>
        </div>
      </div>
    </div>
  );
}
