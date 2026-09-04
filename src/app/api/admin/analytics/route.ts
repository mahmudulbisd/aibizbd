import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/api-auth";
import { getAdminAnalytics } from "@/lib/queries/analytics";
import type { AnalyticsRange } from "@/lib/dto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const url = new URL(req.url);
  const raw = url.searchParams.get("range") ?? "30d";
  const range: AnalyticsRange = raw === "7d" || raw === "all" ? raw : "30d";

  const data = await getAdminAnalytics(range);
  return NextResponse.json(data);
}
