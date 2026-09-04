"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Send,
  Loader2,
  X,
} from "lucide-react";
import type { Order } from "@/db/schema";
import { formatBDT } from "@/lib/site";

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [ordersList, setOrdersList] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [manualCreds, setManualCreds] = useState<string>("");
  const [manualInstructions, setManualInstructions] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter logic
  const filteredOrders = ordersList.filter((o) => {
    const matchesStatus =
      statusFilter === "ALL" || o.status === statusFilter;
    const q = search.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      (o.paymentTxId && o.paymentTxId.toLowerCase().includes(q)) ||
      (o.productSnapshot?.title && o.productSnapshot.title.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function openEditModal(order: Order) {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setManualCreds(order.delivery?.data ?? "");
    setManualInstructions(order.delivery?.instructions?.[0] ?? "");
    setErrorMsg(null);
  }

  async function handleUpdateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: selectedOrder.orderNumber,
          status: newStatus,
          manualCredentials: manualCreds,
          manualInstructions: manualInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Update local state
      setOrdersList((prev) =>
        prev.map((o) =>
          o.orderNumber === selectedOrder.orderNumber
            ? {
                ...o,
                status: (manualCreds ? "DELIVERED" : newStatus) as Order["status"],
                delivery: manualCreds
                  ? {
                      type: o.productSnapshot?.deliveryType ?? "CREDENTIALS",
                      data: manualCreds,
                      instructions: [manualInstructions || "Delivered by admin"],
                    }
                  : o.delivery,
              }
            : o,
        ),
      );

      setSelectedOrder(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Email, Phone, TrxID…"
            className="w-full rounded-xl border border-white/10 bg-[#0d121f] px-4 py-2.5 pl-10 text-xs text-white placeholder-white/30 outline-none transition focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8b93a7]" />
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#0d121f] p-1">
          {["ALL", "DELIVERED", "PAID", "PROCESSING", "PENDING", "FAILED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1 text-[11px] font-bold tracking-wider transition ${
                statusFilter === status
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-[#8b93a7] hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d121f]/90 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-[#8b93a7]">
            <tr>
              <th className="px-4 py-3.5">Order Number</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Product</th>
              <th className="px-4 py-3.5">Amount</th>
              <th className="px-4 py-3.5">Gateway & TxID</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Delivered Item</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium text-[#c3cad8]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[#8b93a7]">
                  No matching orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.orderNumber} className="transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-cyan-300">
                      {o.orderNumber}
                    </div>
                    <div className="text-[10px] text-[#6b7280]">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{o.customerEmail}</div>
                    <div className="text-[11px] text-[#8b93a7]">{o.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-white">
                      {o.productSnapshot?.title ?? "Product"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-white">
                    {formatBDT(o.amountPaidBdt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {o.paymentMethod}
                    </span>
                    {o.paymentTxId && (
                      <div className="mt-1 font-mono text-[10px] text-[#8b93a7] truncate max-w-[120px]" title={o.paymentTxId}>
                        Tx: {o.paymentTxId}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        o.status === "DELIVERED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : o.status === "PAID"
                          ? "bg-blue-500/20 text-blue-400"
                          : o.status === "PROCESSING"
                          ? "bg-purple-500/20 text-purple-400"
                          : o.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {o.delivery?.data ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#6b7280]">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(o)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Manage</span>
                    </button>
                    <Link
                      href={`/order/${o.orderNumber}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-[#8b93a7] transition hover:text-white"
                      title="Open Customer Receipt"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Fulfill Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Manage Order:{" "}
                  <span className="font-mono text-cyan-400">
                    {selectedOrder.orderNumber}
                  </span>
                </h3>
                <p className="text-[11px] text-[#8b93a7]">
                  {selectedOrder.customerEmail} · {selectedOrder.customerPhone}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-[#8b93a7] hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="mt-4 space-y-4 text-xs">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-[#9aa3b6]">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="PENDING">PENDING (Awaiting payment)</option>
                  <option value="PAID">PAID (Payment verified)</option>
                  <option value="PROCESSING">PROCESSING (Supplier purchase)</option>
                  <option value="DELIVERED">DELIVERED (Credentials released)</option>
                  <option value="FAILED">FAILED (Payment/supplier error)</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              {/* Manual Delivery Credentials */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold uppercase tracking-wider text-[#9aa3b6]">
                    Manual Credentials / Activation Key / Link
                  </label>
                  <span className="text-[10px] text-cyan-400">
                    Auto-marks as DELIVERED & encrypts
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={manualCreds}
                  onChange={(e) => setManualCreds(e.target.value)}
                  placeholder="e.g. Email: user@domain.com | Password: SecretPassword123 or https://invite-link…"
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] p-3 text-xs font-mono text-white placeholder-white/20 outline-none focus:border-cyan-500"
                />
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-[#9aa3b6]">
                  Customer Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={manualInstructions}
                  onChange={(e) => setManualInstructions(e.target.value)}
                  placeholder="e.g. Log in at canva.com using these credentials."
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500"
                />
              </div>

              {/* Quick Copy Receipt Link */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8b93a7]">
                    Customer Receipt URL:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/order/${selectedOrder.orderNumber}`,
                        "receipt",
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    {copiedKey === "receipt" ? (
                      <>
                        <Check className="h-3 w-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy Link
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-1 font-mono text-[10px] text-white/60 truncate">
                  /order/{selectedOrder.orderNumber}
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-[#8b93a7] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
