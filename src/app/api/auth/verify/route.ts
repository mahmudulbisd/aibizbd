import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

/** Handles the magic-link click: validates token, sets session cookie, redirects. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", url.origin));
  }

  const payload = verifyToken(token);
  if (!payload || payload.purpose !== "magic") {
    return NextResponse.redirect(new URL("/login?error=expired", url.origin));
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(payload.email), sessionCookieOptions());

  const next = url.searchParams.get("next") ?? "/dashboard";
  return NextResponse.redirect(new URL(next, url.origin));
}
