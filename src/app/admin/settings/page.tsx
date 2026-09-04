import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Key,
  Lock,
  Database,
  CreditCard,
  Send,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getSystemDiagnostics } from "@/lib/admin-queries";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Site & Auth Settings — Ai Biz BD Admin",
  description: "Environment keys, authentication diagnostics and site configurations.",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const d = getSystemDiagnostics();

  return (
    <AdminShell activeTab="settings">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Site & Auth <span className="text-gradient">Settings</span>
          </h1>
          <p className="mt-1 text-xs text-[#8b93a7]">
            Diagnostics for database, master encryption keys, payment gateways and automated alert webhooks.
          </p>
        </div>

        <Link
          href="/admin/commands"
          className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Go to Command Center</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Core Security & Authentication Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d121f]/90 p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Security & Master Auth</h3>
              <p className="text-[11px] text-[#8b93a7]">Encryption keys & access protection</p>
            </div>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            {/* Admin Password */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
              <div>
                <div className="font-semibold text-white">Admin Dashboard Key</div>
                <div className="text-[11px] text-[#8b93a7]">
                  {d.auth.hasAdminPassword
                    ? "Custom key active via ADMIN_PASSWORD"
                    : "Default security key active (aibizbd-admin-2026)"}
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  d.auth.hasAdminPassword
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {d.auth.hasAdminPassword ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Custom
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3" /> Default
                  </>
                )}
              </span>
            </div>

            {/* Encryption Key */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
              <div>
                <div className="font-semibold text-white">AES-256 Master Key (ENCRYPTION_KEY)</div>
                <div className="text-[11px] text-[#8b93a7]">{d.encryption.note}</div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  d.encryption.isConfigured
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {d.encryption.isConfigured ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Configured
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3" /> Unset
                  </>
                )}
              </span>
            </div>

            {/* Auth Secret */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
              <div>
                <div className="font-semibold text-white">Session JWT Signer (AUTH_SECRET)</div>
                <div className="text-[11px] text-[#8b93a7]">
                  Signs customer passwordless magic links & admin tokens
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  d.auth.hasAuthSecret
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {d.auth.hasAuthSecret ? "Custom Key" : "Auto Derived"}
              </span>
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d121f]/90 p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Database & Infrastructure</h3>
              <p className="text-[11px] text-[#8b93a7]">PostgreSQL storage & connection</p>
            </div>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Postgres Connection</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    d.database.isConfigured
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {d.database.isConfigured ? "Connected" : "Unlinked"}
                </span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-[#8b93a7]">
                {d.database.provider}
              </div>
            </div>

            {/* Telegram Bot Alerts */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold text-white">Telegram Admin Alerts</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    d.alerts.hasTelegramBot && d.alerts.hasTelegramChatId
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/10 text-[#8b93a7]"
                  }`}
                >
                  {d.alerts.hasTelegramBot && d.alerts.hasTelegramChatId ? "Active" : "Optional"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#8b93a7]">{d.alerts.status}</p>
            </div>
          </div>
        </div>

        {/* Payments & Supplier Gateways */}
        <div className="rounded-2xl border border-white/10 bg-[#0d121f]/90 p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payment & Fulfillment Gateways</h3>
              <p className="text-[11px] text-[#8b93a7]">Checkout gateways and automated supplier</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div>
                <span className="font-semibold text-white">Payment Provider</span>
                <p className="text-[11px] text-[#8b93a7]">{d.payments.provider}</p>
              </div>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                bKash · Nagad · Binance
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div>
                <span className="font-semibold text-white">Supplier Provider</span>
                <p className="text-[11px] text-[#8b93a7]">{d.supplier.provider}</p>
              </div>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                {d.supplier.hasProdSellerKey ? "ProdSeller API" : "Mock / Manual"}
              </span>
            </div>
          </div>
        </div>

        {/* Business & Support Details */}
        <div className="rounded-2xl border border-white/10 bg-[#0d121f]/90 p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Storefront Info & Contacts</h3>
              <p className="text-[11px] text-[#8b93a7]">Public details displayed to customers</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/5 py-1.5">
              <span className="text-[#8b93a7]">Store Name:</span>
              <span className="font-semibold text-white">{d.site.name}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1.5">
              <span className="text-[#8b93a7]">Canonical URL:</span>
              <span className="font-mono text-cyan-400">{d.site.url}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1.5">
              <span className="text-[#8b93a7]">Support WhatsApp:</span>
              <span className="font-mono text-white">{d.site.whatsapp}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1.5">
              <span className="text-[#8b93a7]">Support Email:</span>
              <span className="font-mono text-white">{d.site.email}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#8b93a7]">Operating Base:</span>
              <span className="text-white">{d.site.location}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
