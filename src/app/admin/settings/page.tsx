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
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: `${dict.admin.settingsTitle} — Ai Biz BD Admin`,
    description: dict.admin.settingsSub,
  };
}

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
  const { dict } = await getI18n();
  const d = getSystemDiagnostics();
  const a = dict.admin;

  return (
    <AdminShell activeTab="settings">
      <PageHeader
        eyebrow={a.settingsEyebrow}
        title={a.settingsTitle}
        description={a.settingsSub}
        actions={
          <Button href="/admin/commands" variant="secondary">
            <Terminal className="h-3.5 w-3.5" />
            {a.settingsCommandCenter}
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Security & Master Auth */}
        <Card>
          <CardHeader
            icon={<ShieldCheck className="h-4 w-4" />}
            title={a.settingsSecurity}
            description={a.settingsSecurityDesc}
          />
          <CardBody className="space-y-3">
            <StatusRow
              title={a.settingsRowAdminKey}
              detail={d.auth.hasAdminPassword ? a.settingsRowAdminKeyCustom : a.settingsRowAdminKeyDefault}
              badge={d.auth.hasAdminPassword ? a.badgeCustom : a.badgeDefault}
              badgeTone={d.auth.hasAdminPassword ? "emerald" : "amber"}
            />
            <StatusRow
              title={a.settingsRowMasterKey}
              detail={d.encryption.note}
              badge={d.encryption.isConfigured ? a.badgeConfigured : a.badgeUnset}
              badgeTone={d.encryption.isConfigured ? "emerald" : "amber"}
            />
            <StatusRow
              title={a.settingsRowSigner}
              detail={a.settingsRowSignerDetail}
              badge={d.auth.hasAuthSecret ? a.badgeCustomKey : a.badgeAutoDerived}
              badgeTone={d.auth.hasAuthSecret ? "emerald" : "blue"}
            />
          </CardBody>
        </Card>

        {/* Database & Infrastructure */}
        <Card>
          <CardHeader
            icon={<Database className="h-4 w-4" />}
            title={a.settingsDb}
            description={a.settingsDbDesc}
          />
          <CardBody className="space-y-3">
            <StatusRow
              title={a.settingsRowPostgres}
              detail={d.database.provider}
              mono
              badge={d.database.isConfigured ? a.badgeConnected : a.badgeUnlinked}
              badgeTone={d.database.isConfigured ? "emerald" : "amber"}
            />
            <StatusRow
              title={a.settingsRowTelegram}
              detail={d.alerts.status}
              icon={<Send className="h-3.5 w-3.5" />}
              badge={
                d.alerts.hasTelegramBot && d.alerts.hasTelegramChatId ? a.badgeActive : a.badgeOptional
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
            title={a.settingsPayments}
            description={a.settingsPaymentsDesc}
          />
          <CardBody className="space-y-3">
            <StatusRow
              title={a.settingsRowPayment}
              detail={d.payments.provider}
              badge={
                d.payments.hasBkash
                  ? a.badgeBkashLive
                  : d.payments.hasBinance
                    ? a.badgeBinanceLive
                    : a.badgeMockSandbox
              }
              badgeTone={d.payments.hasBkash || d.payments.hasBinance ? "emerald" : "neutral"}
            />
            <StatusRow
              title={a.settingsRowSupplier}
              detail={d.supplier.provider}
              badge={d.supplier.hasProdSellerKey ? a.badgeProdSeller : a.badgeMockManual}
              badgeTone={d.supplier.hasProdSellerKey ? "violet" : "neutral"}
            />
          </CardBody>
        </Card>

        {/* Storefront info & contacts */}
        <Card>
          <CardHeader
            icon={<Building2 className="h-4 w-4" />}
            title={a.settingsStore}
            description={a.settingsStoreDesc}
          />
          <CardBody>
            <LabelRow label={a.settingsLabelStore} value={d.site.name} />
            <LabelRow label={a.settingsLabelUrl} value={d.site.url} mono />
            <LabelRow label={a.settingsLabelWhatsapp} value={d.site.whatsapp} mono />
            <LabelRow label={a.settingsLabelEmail} value={d.site.email} mono />
            <LabelRow label={a.settingsLabelBase} value={d.site.location} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-faint">
        <span>{a.settingsReadOnly}</span>
        <Link href="/admin/commands" className="inline-flex items-center gap-1 font-semibold text-accent hover:text-cyan-200">
          {a.settingsViewRunbook} <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </AdminShell>
  );
}
