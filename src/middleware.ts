import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  detectLocaleFromHeaders,
  isLocale,
} from "@/lib/i18n/config";

/**
 * Geo-based default locale. Bangladeshi visitors get Bengali on their first
 * visit; the toggle persists via cookie. No redirects — URLs are locale-free.
 */
export function middleware(req: NextRequest) {
  const existing = req.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(existing) ? existing : detectLocaleFromHeaders(req.headers);
  if (existing === locale) return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
