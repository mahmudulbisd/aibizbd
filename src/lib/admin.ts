import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "aibizbd_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdminSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.ENCRYPTION_KEY ?? "aibizbd-admin-secret-seed-2026";
}

export function getExpectedAdminPassword(): string {
  return (
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.ADMIN_SECRET_KEY?.trim() ||
    "aibizbd-admin-2026"
  );
}

export function verifyAdminPassword(inputPassword: string): boolean {
  const expected = getExpectedAdminPassword();
  if (!inputPassword || typeof inputPassword !== "string") return false;
  
  const a = Buffer.from(inputPassword.trim());
  const b = Buffer.from(expected.trim());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminSessionToken(): string {
  const payload = {
    role: "admin",
    exp: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getAdminSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyAdminSessionToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;

  const expectedSig = crypto.createHmac("sha256", getAdminSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      role: string;
      exp: number;
    };
    if (payload.role !== "admin" || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token);
}

export async function requireAdmin(): Promise<void> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }
}

export function adminCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  };
}
