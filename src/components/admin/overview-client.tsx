"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Database,
  Terminal,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Package,
} from "lucide-react";
import type { AdminAnalyticsDTO, AnalyticsRange } from "@/lib/dto";
import { formatMoney } from "@/lib/format";
import { useI18n } from "@/components/locale-provider";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TableContainer, Table, THead, TH, TBody, TR, TD, EmptyRow } from "@/components/ui/table";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart, COLOR_MAP } from "@/components/charts/donut-chart";

const RANGES: AnalyticsRange[] = ["7d", "30d", "all"];

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: COLOR_MAP.emerald,
  PAID: COLOR_MAP.blue,
  PROCESSING: COLOR_MAP.purple,
  PENDING: COLOR_MAP.amber,
  FAILED: COLOR_MAP.rose,
  REFUNDED: COLOR_MAP.rose,
};

export function OverviewClient({ initialData }: { initialData: AdminAnalyticsDTO }) {
  const { dict } = useI18n();
  const [range, setRange] = useState<AnalyticsRange>(initialData.range);
  const [data, setData] = useState<AdminAnalyticsDTO>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip the network call when the requested range matches the initial server data.
    if (range === initialData.range) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?range=${range}`);
        const d = (await res.json()) as AdminAnalyticsDTO;
        if (!cancelled) setData(d);
      } catch {
        if (!cancelled) setData((prev) => ({ ...prev, range }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();

    return () => {
      cancelled = true;
    };
  }, [range, initialData]);

  const changeRange = useCallback((r: string) => setRange(r as AnalyticsRange), []);
  const { kpis, series, statusSplit, topProducts, paymentSplit, recentOrders } = data;
  const totalOrdersInWindow = kpis.orders;
  const bdt = (v: number) => formatMoney(v, "BDT");

  const donutSegments = statusSplit.map((s) => ({
    label: dict.status[s.status as keyof typeof dict.status] ?? s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? "#5b6377",
  }));

  return (
    <div className="mt-6 space-y-6">
      {!data.dbConnected && (
        <Alert
          tone="warning"
          icon={<Database className="h-4 w-4" />}
          title={dict.admin.dbConnecting}
          action={
            <Button href="/admin/commands" size="sm" variant="secondary">
              <Terminal className="h-3.5 w-3.5" />
              {dict.admin.migrationGuide}
            </Button>
          }
        >
          {dict.admin.dbConnectingBody}
        </Alert>
      )}

      {/* Range toggle */}
      <div className="flex justify-end">
        <Tabs
          items={RANGES.map((r) => ({ id: r, label: r === "all" ? dict.admin.ordersAll : r.toUpperCase() }))}
          value={range}
          onChange={changeRange}
        />
      </div>

      {/* KPI row */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={dict.admin.revenue}
            value={bdt(kpis.revenueBdt)}
            sub={`${kpis.paid} + ${kpis.delivered}`}
            icon={<TrendingUp className="h-4 w-4" />}
            tone="emerald"
          />
          <StatCard
            label={dict.admin.orders}
            value={totalOrdersInWindow}
            sub={dict.admin.ordersAll}
            icon={<ShoppingCart className="h-4 w-4" />}
            tone="cyan"
          />
          <StatCard
            label={dict.status.DELIVERED}
            value={kpis.delivered}
            sub={`${kpis.processing} ${dict.status.PROCESSING}`}
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="violet"
          />
          <StatCard
            label={dict.status.PENDING}
            value={kpis.needsAction}
            sub={`${kpis.pending} · ${kpis.failed} ${dict.status.FAILED}`}
            icon={<Clock className="h-4 w-4" />}
            tone="amber"
          />
        </div>
      )}

      {/* Revenue + orders charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<TrendingUp className="h-4 w-4" />} title={dict.admin.revenue} description={dict.admin.revenueDesc} />
          <div className="p-4">
            {loading ? <Skeleton className="h-[200px]" /> : <AreaChart data={series.map((s) => ({ date: s.date, value: s.revenueBdt }))} />}
          </div>
        </Card>
        <Card>
          <CardHeader icon={<ShoppingCart className="h-4 w-4" />} title={dict.admin.ordersChartTitle} description={dict.admin.ordersChartDesc} />
          <div className="p-4">
            {loading ? <Skeleton className="h-[160px]" /> : <BarChart data={series.map((s) => ({ label: s.date, value: s.orders }))} />}
          </div>
        </Card>
      </div>

      {/* Status donut + payment split + top products */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader icon={<CheckCircle2 className="h-4 w-4" />} title={dict.admin.statusSplit} />
          <div className="flex min-h-[180px] items-center justify-center p-4">
            {loading ? <Skeleton className="h-[160px] w-full" /> : <DonutChart segments={donutSegments} centerLabel={dict.admin.orders} />}
          </div>
        </Card>

        <Card>
          <CardHeader icon={<AlertTriangle className="h-4 w-4" />} title={dict.admin.paymentMethods} />
          <div className="space-y-3 p-5">
            {paymentSplit.length === 0 ? (
              <p className="py-8 text-center text-xs text-faint">{dict.admin.noPayments}</p>
            ) : (
              paymentSplit.map((p) => {
                const maxRev = Math.max(...paymentSplit.map((x) => x.revenueBdt), 1);
                const pct = maxRev > 0 ? Math.round((p.revenueBdt / maxRev) * 100) : 0;
                return (
                  <div key={p.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">
                        {dict.payment[p.method as keyof typeof dict.payment] ?? p.method}
                      </span>
                      <span className="font-mono text-subtle">
                        {p.orders} · {bdt(p.revenueBdt)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.05]">
                      <div className="h-1.5 rounded-full bg-cyan-500/70" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <CardHeader icon={<Package className="h-4 w-4" />} title={dict.admin.topProducts} />
          <div className="space-y-2 p-4">
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-faint">{dict.admin.noProductSales}</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.slug} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.03]">
                  <span className="font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-ink">{p.title}</div>
                    <div className="font-mono text-[10px] text-faint">{p.slug}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-ink">{bdt(p.revenueBdt)}</div>
                    <div className="text-[10px] text-faint">{p.orders} {dict.admin.orders}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader
          icon={<ShoppingCart className="h-4 w-4" />}
          title={dict.admin.recentOrders.replace("{count}", String(recentOrders.length))}
          action={
            <Button href="/admin/orders" size="sm" variant="ghost">
              {dict.common.viewAll}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <TH>{dict.dashboard.colOrder}</TH>
                <TH>{dict.admin.colCustomer}</TH>
                <TH>{dict.admin.colProduct}</TH>
                <TH>{dict.admin.colAmount}</TH>
                <TH>{dict.dashboard.colStatus}</TH>
                <TH className="text-right">{dict.common.receipt}</TH>
              </tr>
            </THead>
            <TBody>
              {recentOrders.length === 0 ? (
                <EmptyRow colSpan={6} message={dict.admin.noOrdersRange} />
              ) : (
                recentOrders.map((o) => (
                  <TR key={o.orderNumber}>
                    <TD>
                      <span className="font-mono font-bold text-cyan-300">{o.orderNumber}</span>
                    </TD>
                    <TD>
                      <div className="font-semibold text-ink">{o.customerEmail}</div>
                      <div className="text-[11px] text-faint">{o.customerPhone}</div>
                    </TD>
                    <TD className="text-ink">{o.productTitle ?? dict.dashboard.digitalItem}</TD>
                    <TD className="font-mono font-bold text-ink">{bdt(Number(o.amountPaidBdt))}</TD>
                    <TD>
                      <StatusBadge status={o.status} label={dict.status[o.status as keyof typeof dict.status]} />
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/order/${o.orderNumber}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-cyan-200"
                      >
                        {dict.common.receipt} <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Status counts legend */}
      {statusSplit.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {statusSplit.map((s) => (
            <span
              key={s.status}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[11px] text-subtle"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s.status] ?? "#5b6377" }} />
              {dict.status[s.status as keyof typeof dict.status] ?? s.status}
              <span className="font-mono font-bold text-ink">{s.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
