"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Edit3, ExternalLink, CheckCircle2 } from "lucide-react";
import type { AdminOrderDTO } from "@/lib/dto";
import { formatBDT } from "@/lib/site";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableContainer, Table, THead, TH, TBody, TR, TD, EmptyRow } from "@/components/ui/table";
import { ManageOrderDialog } from "./manage-order-dialog";

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "PAID", label: "Paid" },
  { id: "PROCESSING", label: "Processing" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "FAILED", label: "Failed" },
  { id: "REFUNDED", label: "Refunded" },
];

export function OrdersManagerClient() {
  const [items, setItems] = useState<AdminOrderDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<AdminOrderDTO | null>(null);
  // Encapsulates the current fetch params; changes trigger a reload via effect.
  const [query, setQuery] = useState({ q: "", st: "ALL" as string });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const params = new URLSearchParams();
      if (query.q) params.set("search", query.q);
      if (query.st !== "ALL") params.set("status", query.st);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json().catch(() => null);
      if (cancelled) return;
      if (res.ok && data?.items) {
        setItems(data.items as AdminOrderDTO[]);
        setTotal(data.total as number);
      } else {
        setItems([]);
        setTotal(0);
      }
      setLoading(false);
    }
    void run();

    return () => {
      cancelled = true;
    };
  }, [query]);

  function handleSearch(v: string) {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setQuery({ q: v, st: status });
    }, 350);
  }

  function handleStatusChange(id: string) {
    setStatus(id);
    setLoading(true);
    setQuery({ q: search, st: id });
  }

  function handleSaved(updated: AdminOrderDTO) {
    setItems((prev) => prev.map((o) => (o.orderNumber === updated.orderNumber ? updated : o)));
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by order #, email, phone, TxID…"
            className="pl-10"
          />
        </div>
        <span className="font-mono text-xs text-faint">{total} orders</span>
      </div>

      <Tabs
        items={FILTERS.map((f) => ({ id: f.id, label: f.label }))}
        value={status}
        onChange={handleStatusChange}
      />

      <TableContainer>
        <Table>
          <THead>
            <tr>
              <TH>Order</TH>
              <TH>Customer</TH>
              <TH>Product</TH>
              <TH>Amount</TH>
              <TH>Gateway</TH>
              <TH>Status</TH>
              <TH>Delivery</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <EmptyRow colSpan={8} message="Loading orders…" />
            ) : items.length === 0 ? (
              <EmptyRow colSpan={8} message="No matching orders found." />
            ) : (
              items.map((o) => (
                <TR key={o.orderNumber}>
                  <TD>
                    <span className="font-mono font-bold text-cyan-300">{o.orderNumber}</span>
                    <div className="text-[10px] text-faint">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </TD>
                  <TD>
                    <div className="font-semibold text-ink">{o.customerEmail}</div>
                    <div className="text-[11px] text-subtle">{o.customerPhone}</div>
                  </TD>
                  <TD className="text-ink">{o.productTitle ?? "Digital item"}</TD>
                  <TD className="font-mono font-bold text-ink">{formatBDT(o.amountPaidBdt)}</TD>
                  <TD>
                    <PaymentBadge method={o.paymentMethod} />
                    {o.paymentTxId && (
                      <div className="mt-1 max-w-[120px] truncate font-mono text-[10px] text-faint" title={o.paymentTxId}>
                        {o.paymentTxId}
                      </div>
                    )}
                  </TD>
                  <TD><StatusBadge status={o.status} /></TD>
                  <TD>
                    {o.deliveryDataReady ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-[11px] text-faint">None</span>
                    )}
                  </TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelected(o)}>
                        <Edit3 className="h-3 w-3" />
                        Manage
                      </Button>
                      <Button size="sm" variant="ghost" href={`/order/${o.orderNumber}`} target="_blank" title="Open customer receipt">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </TableContainer>

      {selected && (
        <ManageOrderDialog
          order={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
