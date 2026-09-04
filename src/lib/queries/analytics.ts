import "server-only";
import { sql } from "drizzle-orm";
import { db, dbHealthy } from "@/db";
import { toAdminOrderDTO } from "./admin-orders";
import type { Order } from "@/db/schema";
import type { AdminAnalyticsDTO, AnalyticsPoint, AnalyticsRange } from "@/lib/dto";
import { zeroAnalytics } from "@/lib/dto";

/** Paid states count toward recognized revenue. */
const REVENUE_STATES = "'PAID','DELIVERED'";

function rangeDays(range: AnalyticsRange): number | null {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  return null; // lifetime
}

/** Returns ISO date (YYYY-MM-DD) for a Date — matches Postgres date_trunc::date text. */
function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function zeroFill(days: number, rows: { day: string; revenue: number; orders: number }[]): AnalyticsPoint[] {
  const map = new Map(rows.map((r) => [toISODate(new Date(r.day)), r]));
  const out: AnalyticsPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toISODate(d);
    const hit = map.get(key);
    out.push({
      date: key,
      revenueBdt: hit ? Number(hit.revenue ?? 0) : 0,
      orders: hit ? Number(hit.orders ?? 0) : 0,
    });
  }
  return out;
}

/** Admin analytics: real SQL aggregations over orders. */
export async function getAdminAnalytics(range: AnalyticsRange = "30d"): Promise<AdminAnalyticsDTO> {
  const zero = zeroAnalytics(range);
  if (!(await dbHealthy())) return zero;

  const days = rangeDays(range);
  const windowClause = days ? sql`created_at >= now() - make_interval(days => ${days})` : sql`created_at IS NOT NULL`;

  try {
    // 1. Daily revenue + orders series.
    const seriesRows = await db.execute<{
      day: string;
      revenue: number;
      orders: number;
    }>(sql`
      SELECT date_trunc('day', created_at)::date AS day,
             COALESCE(sum(amount_paid_bdt::float8) FILTER (WHERE status IN (${sql.raw(REVENUE_STATES)})), 0) AS revenue,
             count(*)::int AS orders
      FROM orders
      WHERE ${windowClause}
      GROUP BY 1
      ORDER BY 1
    `);

    // 2. Status split.
    const statusRows = await db.execute<{ status: string; count: number }>(sql`
      SELECT status, count(*)::int AS count
      FROM orders
      WHERE ${windowClause}
      GROUP BY 1
    `);

    // 3. Payment method split (revenue only from paid states).
    const paymentRows = await db.execute<{ method: string; orders: number; revenue: number }>(sql`
      SELECT payment_method AS method,
             count(*)::int AS orders,
             COALESCE(sum(amount_paid_bdt::float8) FILTER (WHERE status IN (${sql.raw(REVENUE_STATES)})), 0) AS revenue
      FROM orders
      WHERE ${windowClause}
      GROUP BY 1
      ORDER BY revenue DESC NULLS LAST
    `);

    // 4. Top products by revenue (snapshot slug; resolve title from DB products).
    const productRows = await db.execute<{ slug: string; title: string | null; orders: number; revenue: number }>(sql`
      SELECT o.product_snapshot->>'slug' AS slug,
             COALESCE(p.title, o.product_snapshot->>'title') AS title,
             count(*)::int AS orders,
             COALESCE(sum(o.amount_paid_bdt::float8) FILTER (WHERE o.status IN (${sql.raw(REVENUE_STATES)})), 0) AS revenue
      FROM orders o
      LEFT JOIN products p ON p.slug = o.product_snapshot->>'slug'
      WHERE o.product_snapshot IS NOT NULL AND ${windowClause}
      GROUP BY 1, 2
      ORDER BY revenue DESC NULLS LAST
      LIMIT 5
    `);

    // 5. Recent orders (raw rows for DTO mapping).
    const recentRows = await db.execute<Order>(sql`
      SELECT * FROM orders
      WHERE ${windowClause}
      ORDER BY created_at DESC
      LIMIT 8
    `).then((r) => r as unknown as Order[]);

    const statusCounts: Record<string, number> = {};
    for (const r of statusRows) statusCounts[r.status] = Number(r.count ?? 0);

    const count = (s: string) => statusCounts[s] ?? 0;

    // Revenue within the window = sum of the daily series. For lifetime, one SQL sum.
    let revenue = 0;
    if (days) {
      revenue = seriesRows.reduce((s, r) => s + Number(r.revenue ?? 0), 0);
    } else if (statusCounts["PAID"] || statusCounts["DELIVERED"]) {
      revenue = await db.execute<{ total: number }>(sql`
        SELECT COALESCE(sum(amount_paid_bdt::float8), 0) AS total FROM orders
        WHERE status IN (${sql.raw(REVENUE_STATES)})
      `).then((r) => Number((r[0] as { total: number }).total ?? 0));
    }

    return {
      range,
      dbConnected: true,
      kpis: {
        revenueBdt: revenue,
        orders: statusRows.reduce((s, r) => s + Number(r.count ?? 0), 0),
        paid: count("PAID"),
        delivered: count("DELIVERED"),
        processing: count("PROCESSING"),
        pending: count("PENDING"),
        failed: count("FAILED"),
        refunded: count("REFUNDED"),
        needsAction: count("PENDING") + count("PROCESSING") + count("FAILED"),
      },
      series: days ? zeroFill(days, seriesRows) : [],
      statusSplit: statusRows.map((r) => ({ status: r.status, count: Number(r.count ?? 0) })),
      topProducts: productRows.map((r) => ({
        slug: r.slug,
        title: r.title ?? r.slug,
        orders: Number(r.orders ?? 0),
        revenueBdt: Number(r.revenue ?? 0),
      })),
      paymentSplit: paymentRows.map((r) => ({ method: r.method, orders: Number(r.orders ?? 0), revenueBdt: Number(r.revenue ?? 0) })),
      recentOrders: recentRows.map(toAdminOrderDTO),
    };
  } catch (err) {
    console.error("[analytics] aggregation failed:", err);
    return zero;
  }
}
