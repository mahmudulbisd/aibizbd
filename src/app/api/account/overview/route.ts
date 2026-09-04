import { NextResponse } from "next/server";
import { accountGuard, accountUser } from "@/lib/api-auth";
import { getAccountOverview } from "@/lib/queries/account";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await accountGuard();
  if (guard) return guard;

  const user = await accountUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getAccountOverview(user.email);
  return NextResponse.json(data);
}
