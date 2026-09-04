import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/api-auth";
import { getSystemDiagnostics } from "@/lib/queries/system";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  return NextResponse.json({ diagnostics: getSystemDiagnostics() });
}
