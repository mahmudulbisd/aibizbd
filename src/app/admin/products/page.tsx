import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getAdminCatalog, type AdminCatalogItem } from "@/lib/queries/catalog";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableContainer, Table, THead, TH, TBody, TR, TD, EmptyRow } from "@/components/ui/table";
import { formatMoney } from "@/lib/format";
import { grossMarginPct } from "@/lib/pricing";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: `${dict.admin.productsTitle} — Ai Biz BD Admin`,
    description: dict.admin.productsSub,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const [{ dict }, catalog] = await Promise.all([getI18n(), getAdminCatalog()]);

  return (
    <AdminShell activeTab="products">
      <PageHeader
        eyebrow={dict.admin.productsEyebrow}
        title={dict.admin.productsTitle}
        description={dict.admin.productsSub}
        actions={
          <Button href="/#products" target="_blank" variant="secondary">
            <ExternalLink className="h-3.5 w-3.5" />
            {dict.admin.productsPreview}
          </Button>
        }
      />

      <div className="mt-6">
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <TH>{dict.admin.colProduct}</TH>
                <TH>{dict.admin.colRetailBdt}</TH>
                <TH>{dict.admin.colPriceUsd}</TH>
                <TH>{dict.admin.colWholesale}</TH>
                <TH>{dict.admin.colMargin}</TH>
                <TH>{dict.admin.colFulfillment}</TH>
                <TH>{dict.admin.colWarranty}</TH>
                <TH className="text-right">{dict.dashboard.colStatus}</TH>
              </tr>
            </THead>
            <TBody>
              {catalog.length === 0 ? (
                <EmptyRow colSpan={8} message={dict.admin.productsEmpty} />
              ) : (
                catalog.map((p: AdminCatalogItem) => {
                  const priceUsd = Number(p.priceUsd ?? 0);
                  const costUsd = Number(p.wholesaleCostUsd ?? 0);
                  const profitUsd = priceUsd - costUsd;
                  const marginPct = grossMarginPct(priceUsd, costUsd);
                  const marginTone = marginPct >= 50 ? "emerald" : marginPct >= 20 ? "blue" : "amber";
                  const warrantyLabel = dict.admin.days.replace("{days}", String(p.warrantyDays));

                  return (
                    <TR key={p.slug}>
                      <TD>
                        <div className="font-semibold text-ink">{p.title}</div>
                        <div className="font-mono text-[11px] text-accent/80">{p.slug}</div>
                      </TD>
                      <TD className="font-mono font-bold text-ink">{formatMoney(p.priceBdt, "BDT")}</TD>
                      <TD className="font-mono text-ink">${priceUsd.toFixed(2)}</TD>
                      <TD className="font-mono text-amber-400">${costUsd.toFixed(2)}</TD>
                      <TD>
                        <Badge tone={marginTone}>
                          +{marginPct}% (${profitUsd.toFixed(2)})
                        </Badge>
                      </TD>
                      <TD><Badge tone="neutral">{p.deliveryType}</Badge></TD>
                      <TD className="text-subtle">{warrantyLabel}</TD>
                      <TD className="text-right">
                        {p.isActive ? (
                          <Badge tone="emerald">{dict.admin.live}</Badge>
                        ) : (
                          <Badge tone="rose">{dict.admin.inactive}</Badge>
                        )}
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </TableContainer>
      </div>
    </AdminShell>
  );
}
