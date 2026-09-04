import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  const payload = verifyToken(token);
  if (!payload || payload.purpose !== "session") {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: { email: payload.email } });
}
