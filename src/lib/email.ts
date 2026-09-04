import "server-only";
import type { DeliveryPayload } from "@/lib/types";
import { siteConfig } from "@/lib/site";

/**
 * Delivery email via Resend. Falls back to a console log in development so the
 * pipeline runs without SMTP/API keys. Never sends plaintext credentials to
 * anyone but the order's customer email.
 */
export async function sendDeliveryEmail(input: {
  to: string;
  orderNumber: string;
  productTitle: string;
  delivery: DeliveryPayload;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Ai Biz BD <onboarding@resend.dev>";

  const body = {
    to: input.to,
    orderNumber: input.orderNumber,
    productTitle: input.productTitle,
    type: input.delivery.type,
    data: input.delivery.data,
    instructions: input.delivery.instructions ?? [],
  };

  if (!apiKey) {
    console.log(`[email:dev] delivery email to ${input.to}\n${JSON.stringify(body, null, 2)}`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to: [input.to],
    subject: `Your ${input.productTitle} is ready — ${input.orderNumber}`,
    html: renderHtml(body),
  });
}

function renderHtml(b: {
  orderNumber: string;
  productTitle: string;
  type: string;
  data: string;
  instructions: string[];
}): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const instructions = b.instructions.length
    ? `<ol>${b.instructions.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>`
    : "";
  return `<!doctype html>
<html>
  <body style="margin:0;background:#07090e;font-family:Segoe UI,Arial,sans-serif;color:#e8ecf4;padding:32px 16px">
    <div style="max-width:560px;margin:auto;background:#0b0e16;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px">
      <div style="font-size:12px;letter-spacing:2px;color:#8b93a7">AI BIZ BD</div>
      <h1 style="font-size:22px;margin:8px 0 4px">${esc(b.productTitle)} — unlocked 🔓</h1>
      <p style="color:#8b93a7;margin:0 0 24px">Order ${esc(b.orderNumber)} · paid in full · delivered instantly</p>
      <div style="background:#111624;border:1px dashed #06b6d4;border-radius:12px;padding:16px 20px;font-family:ui-monospace,Consolas,monospace;font-size:15px;word-break:break-all;color:#22d3ee">${esc(b.data)}</div>
      <div style="margin-top:24px;color:#cbd5e1;font-size:14px;line-height:1.8">${instructions}</div>
      <p style="margin-top:28px;font-size:12px;color:#5b6377">
        Questions? Reply to this email or message us on WhatsApp — ${siteConfig.supportWhatsApp}.<br/>
        © ${new Date().getFullYear()} ${siteConfig.name}
      </p>
    </div>
  </body>
</html>`;
}
