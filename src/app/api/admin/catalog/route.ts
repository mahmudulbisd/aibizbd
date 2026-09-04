import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/api-auth";
import { getAdminCatalog } from "@/lib/queries/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const products = await getAdminCatalog();
  return NextResponse.json({ products });
}
