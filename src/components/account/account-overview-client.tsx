"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Wallet,
  ShieldCheck,
  PackageCheck,
  Eye,
  EyeOff,
  Printer,
  ExternalLink,
  Search,
  HelpCircle,
} from "lucide-react";
import type { AccountOverviewDTO } from "@/lib/dto";
import { formatBDT, siteConfig } from "@/lib/site";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableContainer, Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "PAID", label: "Paid" },
  { id: "PROCESSING", label: "Processing" },
  { id: "PENDING", label: "Pending" },
  { id: "FAILED", label: "Failed" },
];

export function AccountOverviewClient({
  email,
  initialData,
}: {
  email: string;
  initialData: AccountOverviewDTO;
}) {
  const data = initialData;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const q = search.toLowerCase().trim();
  const filtered = data.orders.filter((o) => {
    const matchesStatus = status === "ALL" || o.status === status;
    if (!q) return matchesStatus;
    return (
      matchesStatus &&
      (o.orderNumber.toLowerCase().includes(q) ||
        (o.productTitle ?? "").toLowerCase().includes(q))
    );
  });

  const { stats } = data;
  const dbConnected = data.orders.length > 0 || stats.totalOrders > 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          Customer dashboard
        </p>
        <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          My Account
        </h1>
        <p className="mt-1 text-sm text-subtle">
          Orders, licenses and receipts for{" "}
          <span className="font-mono text-ink">{email}</span>.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total orders"
          value={stats.totalOrders}
          sub={stats.lastOrderAt ? `Last order ${new Date(stats.lastOrderAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "No orders yet"}
          icon={<ShoppingCart className="h-4 w-4" />}
          tone="cyan"
        />
        <StatCard
          label="Total spent"
          value={formatBDT(stats.totalSpentBdt)}
          sub="Paid & delivered orders"
          icon={<Wallet className="h-4 w-4" />}
          tone="emerald"
        />
        <StatCard
          label="Delivered"
          value={stats.deliveredCount}
          sub="Credentials released"
          icon={<PackageCheck className="h-4 w-4" />}
          tone="violet"
        />
        <StatCard
          label="Active warranty"
          value={stats.activeWarrantyCount}
          sub="Replacement coverage"
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      {/* Profile + support */}
      <Card>
        <CardHeader icon={<HelpCircle className="h-4 w-4" />} title="Profile & support" />
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-subtle">
              Signed in as <span className="font-mono font-semibold text-ink">{email}</span>
            </div>
            <p className="mt-1 text-xs text-faint">
              Need help with an order? Reach us on WhatsApp or email.
            </p>
          </div>
          <div className="flex gap-2">
            <Button href={siteConfig.whatsappLink} target="_blank" variant="secondary" size="sm">
              WhatsApp support
            </Button>
            <Button href={`mailto:${siteConfig.contactEmail}`} variant="ghost" size="sm">
              {siteConfig.contactEmail}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Orders */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
            Order history
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="pl-10"
            />
          </div>
        </div>

        <Tabs
          items={FILTERS.map((f) => ({
            id: f.id,
            label: f.label,
            badge: f.id === "ALL" ? stats.totalOrders : data.orders.filter((o) => o.status === f.id).length,
          }))}
          value={status}
          onChange={setStatus}
        />

        {!dbConnected ? (
          <EmptyState
            icon={<ShoppingCart className="h-8 w-8" />}
            title="Dashboard is starting up"
            description="Connect the database and your orders will appear here. Check back in a moment."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching orders"
            description="Orders placed with your email will appear here — with licenses, warranties and receipts."
          />
        ) : (
          <TableContainer>
            <Table>
              <THead>
                <tr>
                  <TH>Order</TH>
                  <TH>Product</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH>Credential</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </THead>
              <TBody>
                {filtered.map((o) => {
                  const isDelivered = o.status === "DELIVERED" && Boolean(o.delivery);
                  const show = Boolean(revealed[o.orderNumber]);
                  return (
                    <TR key={o.orderNumber}>
                      <TD>
                        <span className="font-mono font-bold text-cyan-300">{o.orderNumber}</span>
                        <div className="text-[10px] text-faint">
                          {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}{" "}
                          · {o.paymentMethod.replaceAll("_", " ")}
                        </div>
                      </TD>
                      <TD>
                        <div className="font-semibold text-ink">{o.productTitle ?? "Digital item"}</div>
                        {isDelivered && o.warrantyActive && (
                          <div className="mt-0.5 text-[11px] text-emerald-400">
                            Warranty until{" "}
                            {new Date(o.warrantyEndsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                        {isDelivered && !o.warrantyActive && (
                          <div className="mt-0.5 text-[11px] text-faint">Warranty expired</div>
                        )}
                      </TD>
                      <TD className="font-mono font-bold text-ink">{formatBDT(o.amountPaidBdt)}</TD>
                      <TD><StatusBadge status={o.status} /></TD>
                      <TD>
                        {isDelivered && o.delivery ? (
                          <div className="flex items-center gap-2">
                            <span className="max-w-[140px] truncate font-mono text-[11px] text-cyan-300/90">
                              {show ? o.delivery.data : "••••••••••••••"}
                            </span>
                            {show && <CopyButton text={o.delivery.data} label="" />}
                            <button
                              type="button"
                              onClick={() => setRevealed((prev) => ({ ...prev, [o.orderNumber]: !show }))}
                              className="rounded-md border border-line p-1 text-faint transition hover:text-ink"
                              title={show ? "Hide credential" : "Reveal credential"}
                            >
                              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-faint">
                            {o.status === "FAILED"
                              ? "Delivery failed"
                              : "Processing…"}
                          </span>
                        )}
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" href={`/order/${o.orderNumber}`} target="_blank" title="Delivery page">
                            <ExternalLink className="h-3 w-3" />
                            Track
                          </Button>
                          <Button size="sm" variant="ghost" href={`/order/${o.orderNumber}/receipt`} target="_blank" title="Printable receipt">
                            <Printer className="h-3 w-3" />
                            Receipt
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
}
