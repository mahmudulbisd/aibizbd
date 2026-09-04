import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Tag, ShieldCheck, DollarSign, Layers } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getAdminCatalog, type AdminCatalogItem } from "@/lib/admin-queries";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatBDT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catalog & Margins — Ai Biz BD Admin",
  description: "View product catalog, pricing structures, supplier costs and profit margins.",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const catalog = await getAdminCatalog();

  return (
    <AdminShell activeTab="products">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Catalog & <span className="text-gradient">Margins</span>
          </h1>
          <p className="mt-1 text-xs text-[#8b93a7]">
            Active pricing, supplier wholesale costs, gross margins and delivery configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/#products"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#c3cad8] transition hover:bg-white/10 hover:text-white"
          >
            <span>Preview Storefront Catalog</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d121f]/90 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-[#8b93a7]">
            <tr>
              <th className="px-4 py-3.5">Product</th>
              <th className="px-4 py-3.5">Retail Price (BDT)</th>
              <th className="px-4 py-3.5">Price (USD)</th>
              <th className="px-4 py-3.5">Wholesale Cost</th>
              <th className="px-4 py-3.5">Gross Margin</th>
              <th className="px-4 py-3.5">Fulfillment</th>
              <th className="px-4 py-3.5">Warranty</th>
              <th className="px-4 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium text-[#c3cad8]">
            {catalog.map((p: AdminCatalogItem) => {
              const priceUsd = Number(p.priceUsd ?? 0);
              const costUsd = Number(p.wholesaleCostUsd ?? 0);
              const profitUsd = priceUsd - costUsd;
              const marginPct = priceUsd > 0 ? Math.round((profitUsd / priceUsd) * 100) : 0;

              return (
                <tr key={p.slug} className="transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{p.title}</div>
                    <div className="font-mono text-[11px] text-cyan-400/80">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-white">
                    {formatBDT(p.priceBdt)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#c3cad8]">
                    ${priceUsd.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-amber-400">
                    ${costUsd.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        marginPct >= 50
                          ? "bg-emerald-500/20 text-emerald-400"
                          : marginPct >= 20
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      +{marginPct}% (${profitUsd.toFixed(2)})
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {p.deliveryType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#8b93a7]">
                    {p.warrantyDays} Days
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        p.isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {p.isActive ? "Live" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
