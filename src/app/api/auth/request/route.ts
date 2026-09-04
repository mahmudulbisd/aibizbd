import { NextResponse } from "next/server";
import { z } from "zod";
import { createMagicLinkToken } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

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
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Ai Biz BD <onboarding@resend.dev>",
        to: [email],
        subject: `Your sign-in link — ${siteConfig.name}`,
        html: `<p>Click to sign in to your ${siteConfig.name} account:</p><p><a href="${magicUrl}">Sign in securely</a></p><p>This link expires in 15 minutes.</p>`,
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
