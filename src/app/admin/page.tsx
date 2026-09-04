import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Database,
  ExternalLink,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getAdminOverviewStats, getSystemDiagnostics } from "@/lib/admin-queries";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatBDT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin Overview — Ai Biz BD",
  description: "Real-time metrics, revenue analytics and recent transactions.",
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const { stats, recentOrders, isDbConnected } = await getAdminOverviewStats();
  const diagnostics = getSystemDiagnostics();

  return (
    <AdminShell activeTab="overview" orderCount={stats.totalOrders}>
      {/* DB Connection Alert if not connected */}
      {!isDbConnected && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-amber-200">Database Starting / Connecting</h3>
                <p className="mt-1 text-xs text-amber-300/80">
                  Supabase or Neon database connection is currently pending or initializing. Once connected in Vercel Storage, orders will dynamically populate.
                </p>
              </div>
            </div>
            <Link
              href="/admin/commands"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/30"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Migration Guide</span>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            Realtime Analytics
          </span>
          <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Executive <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="mt-1 text-xs text-[#8b93a7]">
            Live storefront health, order throughput and financial overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <span>Manage All Orders</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d121f]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[#8b93a7]">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-bold text-white">
              {formatBDT(stats.totalRevenueBdt)}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#8b93a7]">
            Paid & fulfilled customer transactions
          </p>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d121f]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[#8b93a7]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-bold text-white">{stats.totalOrders}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#8b93a7]">
            Lifetime storefront checkouts
          </p>
        </div>

        {/* Delivered / Completed */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d121f]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[#8b93a7]">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {stats.deliveredOrders + stats.paidOrders}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#8b93a7]">
            {stats.deliveredOrders} instant delivery, {stats.paidOrders} paid
          </p>
        </div>

        {/* Pending & Attention */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d121f]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[#8b93a7]">
            <span className="text-xs font-semibold uppercase tracking-wider">Needs Action</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-bold text-amber-400">
              {stats.pendingOrders + stats.processingOrders}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#8b93a7]">
            {stats.pendingOrders} pending payment, {stats.failedOrders} failed
          </p>
        </div>
      </div>

      {/* System Status Quick Bar */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-[#070b14]/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Platform Security & Gateway Status
              </h4>
              <p className="text-[11px] text-[#8b93a7]">
                Payment Mode: <strong className="text-cyan-300">{diagnostics.payments.provider}</strong> · Supplier: <strong className="text-blue-300">{diagnostics.supplier.provider}</strong>
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:underline"
          >
            <span>View Full System Diagnostics</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Recent Orders ({recentOrders.length})
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-cyan-400 transition hover:underline"
          >
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d121f]/50 p-10 text-center">
            <p className="text-sm font-medium text-[#8b93a7]">
              No customer orders recorded yet in database.
            </p>
            <p className="mt-1 text-xs text-[#6b7280]">
              Orders placed on your storefront will show up here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#0d121f]/80">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-[#8b93a7]">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-[#c3cad8]">
                {recentOrders.map((o) => (
                  <tr key={o.orderNumber} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{o.customerEmail}</div>
                      <div className="text-[11px] text-[#8b93a7]">{o.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-white">
                      {o.productSnapshot?.title ?? "Digital Item"}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-white">
                      {formatBDT(o.amountPaidBdt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {o.paymentMethod}
                      </span>
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
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/order/${o.orderNumber}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:underline"
                      >
                        <span>Receipt</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
