import "server-only";
import crypto from "node:crypto";

const SESSION_COOKIE = "aibizbd_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  // Falls back to a dev value only when no key is set, so the flow still works
  // locally. In production, set AUTH_SECRET in Vercel.
  return process.env.AUTH_SECRET ?? "dev-auth-secret-change-me";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/** HMAC-signed token: payload.signature (base64url). */
export function signToken(payload: { email: string; purpose: string; exp: number }): string {
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string): { email: string; purpose: string; exp: number } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      email: string;
      purpose: string;
      exp: number;
    };
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(email: string): string {
  return signToken({ email: email.toLowerCase().trim(), purpose: "session", exp: Date.now() + MAX_AGE * 1000 });
}

export function createMagicLinkToken(email: string): string {
  // Short-lived (15 min) login token.
  return signToken({ email: email.toLowerCase().trim(), purpose: "magic", exp: Date.now() + 15 * 60 * 1000 });
}

export function sessionCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: MAX_AGE,
  };
}

export { SESSION_COOKIE, MAX_AGE };
