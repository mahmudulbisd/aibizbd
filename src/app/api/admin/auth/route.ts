import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body.password ?? "");

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Invalid admin password or secret key" },
        { status: 401 },
      );
    }

    const token = createAdminSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions());

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
