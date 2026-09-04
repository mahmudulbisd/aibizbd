import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Database,
  CreditCard,
  Building2,
  Send,
  Terminal,
  ArrowUpRight,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getSystemDiagnostics } from "@/lib/queries/system";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Settings — Ai Biz BD Admin",
  description: "Environment keys, authentication diagnostics and site configuration.",
};

export const dynamic = "force-dynamic";

function StatusRow({
  title,
  detail,
  icon,
  badge,
  badgeTone = "neutral",
  mono = false,
}: {
  title: string;
  detail?: string;
  icon?: React.ReactNode;
  badge: string;
  badgeTone?: BadgeTone;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-white/[0.015] px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && <span className="shrink-0 text-accent">{icon}</span>}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink">{title}</div>
          {detail && (
            <div className={`mt-0.5 text-xs text-faint ${mono ? "font-mono" : ""}`}>{detail}</div>
          )}
        </div>
      </div>
      <Badge tone={badgeTone}>{badge}</Badge>
    </div>
  );
}

function LabelRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
      <span className="text-xs text-subtle">{label}</span>
      <span className={`text-right text-xs font-semibold text-ink ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default async function AdminSettingsPage() {
  await requireAdmin();
  const d = getSystemDiagnostics();

  return (
    <AdminShell activeTab="settings">
      <PageHeader
        eyebrow="System"
        title="Settings & Diagnostics"
        description="Database, master keys, payment gateways and automated alert configuration."
        actions={
          <Button href="/admin/commands" variant="secondary">
            <Terminal className="h-3.5 w-3.5" />
            Command Center
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Security & Master Auth */}
        <Card>
          <CardHeader
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Security & Master Auth"
            description="Encryption keys & access protection"
          />
          <CardBody className="space-y-3">
            <StatusRow
              title="Admin dashboard key"
              detail={d.auth.hasAdminPassword ? "Custom key active via ADMIN_PASSWORD" : "Default security key active"}
              badge={d.auth.hasAdminPassword ? "Custom" : "Default"}
              badgeTone={d.auth.hasAdminPassword ? "emerald" : "amber"}
            />
            <StatusRow
              title="AES-256 master key (ENCRYPTION_KEY)"
              detail={d.encryption.note}
              badge={d.encryption.isConfigured ? "Configured" : "Unset"}
              badgeTone={d.encryption.isConfigured ? "emerald" : "amber"}
            />
            <StatusRow
              title="Session signer (AUTH_SECRET)"
              detail="Signs customer magic links & admin tokens"
              badge={d.auth.hasAuthSecret ? "Custom key" : "Auto derived"}
              badgeTone={d.auth.hasAuthSecret ? "emerald" : "blue"}
            />
          </CardBody>
        </Card>

        {/* Database & Infrastructure */}
        <Card>
          <CardHeader
            icon={<Database className="h-4 w-4" />}
            title="Database & Infrastructure"
            description="PostgreSQL storage & connection"
          />
          <CardBody className="space-y-3">
            <StatusRow
              title="Postgres connection"
              detail={d.database.provider}
              mono
              badge={d.database.isConfigured ? "Connected" : "Unlinked"}
              badgeTone={d.database.isConfigured ? "emerald" : "amber"}
            />
            <StatusRow
              title="Telegram admin alerts"
              detail={d.alerts.status}
              icon={<Send className="h-3.5 w-3.5" />}
              badge={
                d.alerts.hasTelegramBot && d.alerts.hasTelegramChatId ? "Active" : "Optional"
              }
              badgeTone={
                d.alerts.hasTelegramBot && d.alerts.hasTelegramChatId ? "emerald" : "neutral"
              }
            />
          </CardBody>
        </Card>

        {/* Payment & Fulfillment Gateways */}
        <Card>
          <CardHeader
            icon={<CreditCard className="h-4 w-4" />}
            title="Payment & Fulfillment Gateways"
            description="Checkout gateways and automated supplier"
          />
          <CardBody className="space-y-3">
            <StatusRow
              title="Payment provider"
              detail={d.payments.provider}
              badge={d.payments.hasBkash ? "bKash live" : d.payments.hasBinance ? "Binance live" : "Mock / sandbox"}
              badgeTone={d.payments.hasBkash || d.payments.hasBinance ? "emerald" : "neutral"}
            />
            <StatusRow
              title="Supplier provider"
              detail={d.supplier.provider}
              badge={d.supplier.hasProdSellerKey ? "ProdSeller API" : "Mock / manual"}
              badgeTone={d.supplier.hasProdSellerKey ? "violet" : "neutral"}
            />
          </CardBody>
        </Card>

        {/* Storefront info & contacts */}
        <Card>
          <CardHeader
            icon={<Building2 className="h-4 w-4" />}
            title="Storefront info & contacts"
            description="Public details displayed to customers"
          />
          <CardBody>
            <LabelRow label="Store name" value={d.site.name} />
            <LabelRow label="Canonical URL" value={d.site.url} mono />
            <LabelRow label="Support WhatsApp" value={d.site.whatsapp} mono />
            <LabelRow label="Support email" value={d.site.email} mono />
            <LabelRow label="Operating base" value={d.site.location} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-faint">
        <span>Diagnostics are read-only.</span>
        <Link href="/admin/commands" className="inline-flex items-center gap-1 font-semibold text-accent hover:text-cyan-200">
          View runbook for configuring keys <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </AdminShell>
  );
}
