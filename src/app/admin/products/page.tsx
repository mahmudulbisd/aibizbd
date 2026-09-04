import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getAdminCatalog, type AdminCatalogItem } from "@/lib/queries/catalog";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableContainer, Table, THead, TH, TBody, TR, TD, EmptyRow } from "@/components/ui/table";
import { formatBDT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products — Ai Biz BD Admin",
  description: "Product catalog, pricing structures, supplier costs and profit margins.",
};

export const dynamic = "force-dynamic";

function marginBadge(marginPct: number, profitUsd: number) {
  const tone =
    marginPct >= 50 ? "emerald" : marginPct >= 20 ? "blue" : "amber";
  return (
    <Badge tone={tone}>
      +{marginPct}% (${profitUsd.toFixed(2)})
    </Badge>
  );
}

export default async function AdminProductsPage() {
  await requireAdmin();
  const catalog = await getAdminCatalog();

  return (
    <AdminShell activeTab="products">
      <PageHeader
        eyebrow="Catalog"
        title="Products & Margins"
        description="Active pricing, supplier wholesale costs, margins and delivery configuration."
        actions={
          <Button href="/#products" target="_blank" variant="secondary">
            <ExternalLink className="h-3.5 w-3.5" />
            Preview storefront
          </Button>
        }
      />

      <div className="mt-6">
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <TH>Product</TH>
                <TH>Retail (BDT)</TH>
                <TH>Price (USD)</TH>
                <TH>Wholesale cost</TH>
                <TH>Gross margin</TH>
                <TH>Fulfillment</TH>
                <TH>Warranty</TH>
                <TH className="text-right">Status</TH>
              </tr>
            </THead>
            <TBody>
              {catalog.length === 0 ? (
                <EmptyRow colSpan={8} message="No products in the catalog." />
              ) : (
                catalog.map((p: AdminCatalogItem) => {
                  const priceUsd = Number(p.priceUsd ?? 0);
                  const costUsd = Number(p.wholesaleCostUsd ?? 0);
                  const profitUsd = priceUsd - costUsd;
                  const marginPct = priceUsd > 0 ? Math.round((profitUsd / priceUsd) * 100) : 0;

                  return (
                    <TR key={p.slug}>
                      <TD>
                        <div className="font-semibold text-ink">{p.title}</div>
                        <div className="font-mono text-[11px] text-accent/80">{p.slug}</div>
                      </TD>
                      <TD className="font-mono font-bold text-ink">{formatBDT(p.priceBdt)}</TD>
                      <TD className="font-mono text-ink">${priceUsd.toFixed(2)}</TD>
                      <TD className="font-mono text-amber-400">${costUsd.toFixed(2)}</TD>
                      <TD>{marginBadge(marginPct, profitUsd)}</TD>
                      <TD><Badge tone="neutral">{p.deliveryType}</Badge></TD>
                      <TD className="text-subtle">{p.warrantyDays} days</TD>
                      <TD className="text-right">
                        {p.isActive ? <Badge tone="emerald">Live</Badge> : <Badge tone="rose">Inactive</Badge>}
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
