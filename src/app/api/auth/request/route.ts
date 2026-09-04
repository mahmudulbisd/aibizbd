import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createMagicLinkToken } from "@/lib/auth";
import { siteConfig } from "@/lib/site";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

/**
 * Request a passwordless sign-in link.
 * In dev (no RESEND_API_KEY) the link is logged to the console — the same
 * pattern as delivery emails. In production the magic link is emailed.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_EMAIL" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const token = createMagicLinkToken(email);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const magicUrl = `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;

  // Localize the magic-link email from the sender's cookie (default Bengali).
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(raw) ? raw : await getLocale();
  const dict = getDictionary(locale);

  const apiKey = process.env.RESEND_API_KEY;
  const isDev = process.env.NODE_ENV !== "production";
  let devMagicUrl: string | null = null;

  if (!apiKey) {
    // Dev: expose the link so the flow is testable without an email provider.
    devMagicUrl = magicUrl;
    console.log(`[auth:dev] magic link for ${email}: ${magicUrl}`);
  } else {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const subject = dict.email.magicSubject.replace("{name}", siteConfig.name);
      const html = `<p>${dict.email.magicBody.replace("{name}", siteConfig.name)}</p><p><a href="${magicUrl}" style="display:inline-block;background:#06b6d4;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">${dict.email.magicCta}</a></p><p style="color:#5b6377">${dict.email.magicExpires}</p>`;
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Ai Biz BD <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      });
    } catch (err) {
      console.error("magic link email failed:", err);
      return NextResponse.json({ ok: false, error: "EMAIL_FAILED" }, { status: 500 });
    }
  }

  // Always return ok (don't reveal whether an account exists — it's an open flow).
  // In development only, include the direct link so the flow can be demoed.
  return NextResponse.json({ ok: true, ...(isDev && devMagicUrl ? { devMagicUrl } : {}) });
}
