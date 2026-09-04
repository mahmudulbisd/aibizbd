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
import { siteConfig } from "@/lib/site";
import { formatMoney } from "@/lib/format";
import { useI18n } from "@/components/locale-provider";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableContainer, Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";

const STATUS_IDS = ["DELIVERED", "PAID", "PROCESSING", "PENDING", "FAILED"] as const;

export function AccountOverviewClient({
  email,
  initialData,
}: {
  email: string;
  initialData: AccountOverviewDTO;
}) {
  const { dict, currency, dateShort } = useI18n();
  const data = initialData;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const filters = [
    { id: "ALL", label: dict.dashboard.filterAll },
    ...STATUS_IDS.map((s) => ({
      id: s,
      label: dict.status[s as keyof typeof dict.status],
    })),
  ];

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
  const subtitle = dict.dashboard.sub.replace("{email}", email);
  const spent = formatMoney(stats.totalSpentBdt, "BDT"); // transactional total — BDT

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          {dict.dashboard.eyebrow}
        </p>
        <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {dict.dashboard.title}
        </h1>
        <p className="mt-1 text-sm text-subtle">
          {subtitle.split(email)[0]}
          <span className="font-mono text-ink">{email}</span>
          {subtitle.split(email)[1]}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.dashboard.statOrders}
          value={stats.totalOrders}
          sub={
            stats.lastOrderAt
              ? dict.dashboard.statOrdersLast.replace("{date}", dateShort(stats.lastOrderAt))
              : dict.dashboard.statOrdersSub
          }
          icon={<ShoppingCart className="h-4 w-4" />}
          tone="cyan"
        />
        <StatCard
          label={dict.dashboard.statSpent}
          value={spent}
          sub={dict.dashboard.statSpentSub}
          icon={<Wallet className="h-4 w-4" />}
          tone="emerald"
        />
        <StatCard
          label={dict.dashboard.statDelivered}
          value={stats.deliveredCount}
          sub={dict.dashboard.statDeliveredSub}
          icon={<PackageCheck className="h-4 w-4" />}
          tone="violet"
        />
        <StatCard
          label={dict.dashboard.statWarranty}
          value={stats.activeWarrantyCount}
          sub={dict.dashboard.statWarrantySub}
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      {/* Profile + support */}
      <Card>
        <CardHeader icon={<HelpCircle className="h-4 w-4" />} title={dict.dashboard.profileTitle} />
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-subtle">
              {dict.dashboard.signedInAs.replace("{email}", email)}
            </div>
            <p className="mt-1 text-xs text-faint">{dict.dashboard.profileHelp}</p>
          </div>
          <div className="flex gap-2">
            <Button href={siteConfig.whatsappLink} target="_blank" variant="secondary" size="sm">
              {dict.dashboard.whatsappSupport}
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
            {dict.dashboard.orderHistory}
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.dashboard.searchPlaceholder}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs
          items={filters.map((f) => ({
            id: f.id,
            label: f.label,
            badge:
              f.id === "ALL"
                ? stats.totalOrders
                : data.orders.filter((o) => o.status === f.id).length,
          }))}
          value={status}
          onChange={setStatus}
        />

        {!dbConnected ? (
          <EmptyState
            icon={<ShoppingCart className="h-8 w-8" />}
            title={dict.dashboard.emptyStarting}
            description={dict.dashboard.emptyStartingDesc}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={dict.dashboard.emptyNoOrders}
            description={dict.dashboard.emptyNoOrdersDesc}
          />
        ) : (
          <TableContainer>
            <Table>
              <THead>
                <tr>
                  <TH>{dict.dashboard.colOrder}</TH>
                  <TH>{dict.dashboard.colProduct}</TH>
                  <TH>{dict.dashboard.colAmount}</TH>
                  <TH>{dict.dashboard.colStatus}</TH>
                  <TH>{dict.dashboard.colCredential}</TH>
                  <TH className="text-right">{dict.dashboard.colActions}</TH>
                </tr>
              </THead>
              <TBody>
                {filtered.map((o) => {
                  const isDelivered = o.status === "DELIVERED" && Boolean(o.delivery);
                  const show = Boolean(revealed[o.orderNumber]);
                  const methodLabel =
                    dict.payment[o.paymentMethod as keyof typeof dict.payment] ?? o.paymentMethod;
                  return (
                    <TR key={o.orderNumber}>
                      <TD>
                        <span className="font-mono font-bold text-cyan-300">{o.orderNumber}</span>
                        <div className="text-[10px] text-faint">
                          {dateShort(o.createdAt)} · {methodLabel}
                        </div>
                      </TD>
                      <TD>
                        <div className="font-semibold text-ink">
                          {o.productTitle ?? dict.dashboard.digitalItem}
                        </div>
                        {isDelivered && o.warrantyActive && (
                          <div className="mt-0.5 text-[11px] text-emerald-400">
                            {dict.dashboard.warrantyUntil.replace("{date}", dateShort(o.warrantyEndsAt))}
                          </div>
                        )}
                        {isDelivered && !o.warrantyActive && (
                          <div className="mt-0.5 text-[11px] text-faint">
                            {dict.dashboard.warrantyExpired}
                          </div>
                        )}
                      </TD>
                      <TD className="font-mono font-bold text-ink">
                        {formatMoney(o.amountPaidBdt, currency)}
                      </TD>
                      <TD>
                        <StatusBadge status={o.status} label={dict.status[o.status as keyof typeof dict.status]} />
                      </TD>
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
                              title={show ? dict.dashboard.hideCredential : dict.dashboard.revealCredential}
                            >
                              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-faint">
                            {o.status === "FAILED"
                              ? dict.dashboard.deliveryFailed
                              : dict.dashboard.processing}
                          </span>
                        )}
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" href={`/order/${o.orderNumber}`} target="_blank" title={dict.dashboard.deliveryPage}>
                            <ExternalLink className="h-3 w-3" />
                            {dict.dashboard.track}
                          </Button>
                          <Button size="sm" variant="ghost" href={`/order/${o.orderNumber}/receipt`} target="_blank" title={dict.dashboard.printableReceipt}>
                            <Printer className="h-3 w-3" />
                            {dict.common.receipt}
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
