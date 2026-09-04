import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/** Guard for admin route handlers — returns a 401 JSON response or null. */
export async function adminGuard(): Promise<NextResponse | null> {
  const authed = await isAdminAuthenticated();
  return authed ? null : UNAUTHORIZED;
}

/** Returns the signed-in customer email from the session cookie, or null. */
export async function accountUser(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.purpose !== "session") return null;
  return { email: payload.email };
}

/** Guard for customer account route handlers — 401 JSON when not signed in. */
export async function accountGuard(): Promise<NextResponse | null> {
  const user = await accountUser();
  return user ? null : UNAUTHORIZED;
}
