import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

/** Returns the signed-in user's email or redirects to /login. */
export async function requireUser(): Promise<{ email: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.purpose !== "session") {
    redirect("/login");
  }
  return { email: payload.email };
}

/** Returns the signed-in user's email or null (for optional-auth pages). */
export async function getCurrentUser(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.purpose !== "session") return null;
  return { email: payload.email };
}
