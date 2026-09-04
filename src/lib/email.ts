import "server-only";
import type { DeliveryPayload } from "@/lib/types";
import { siteConfig } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";

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
  locale?: Locale;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Ai Biz BD <onboarding@resend.dev>";
  const locale = input.locale ?? "bn";
  const dict = getDictionary(locale);

  const body = {
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

  const subject = dict.email.deliverySubject
    .replace("{product}", input.productTitle)
    .replace("{orderNumber}", input.orderNumber);

  await resend.emails.send({
    from,
    to: [input.to],
    subject,
    html: renderHtml(body, locale, dict),
  });
}

function renderHtml(
  b: {
    orderNumber: string;
    productTitle: string;
    type: string;
    data: string;
    instructions: string[];
  },
  locale: Locale,
  dict: ReturnType<typeof getDictionary>,
): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const instructions = b.instructions.length
    ? `<ol>${b.instructions.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>`
    : "";

  const heading = dict.email.deliveryHeading
    .replace("{product}", esc(b.productTitle));
  const sub = dict.email.deliverySub
    .replace("{orderNumber}", esc(b.orderNumber));
  const help = dict.email.deliveryHelp
    .replace("{number}", esc(siteConfig.supportWhatsApp));
  const copyright = dict.email.deliveryCopyright
    .replace("{year}", String(new Date().getFullYear()))
    .replace("{name}", esc(siteConfig.name));

  return `<!doctype html>
<html lang="${locale === "bn" ? "bn" : "en"}">
  <body style="margin:0;background:#07090e;font-family:Segoe UI,Arial,'Noto Sans Bengali',sans-serif;color:#e8ecf4;padding:32px 16px">
    <div style="max-width:560px;margin:auto;background:#0b0e16;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px">
      <div style="font-size:12px;letter-spacing:2px;color:#8b93a7">AI BIZ BD</div>
      <h1 style="font-size:22px;margin:8px 0 4px">${heading}</h1>
      <p style="color:#8b93a7;margin:0 0 24px">${sub}</p>
      <div style="background:#111624;border:1px dashed #06b6d4;border-radius:12px;padding:16px 20px;font-family:ui-monospace,Consolas,monospace;font-size:15px;word-break:break-all;color:#22d3ee">${esc(b.data)}</div>
      <div style="margin-top:24px;color:#cbd5e1;font-size:14px;line-height:1.8">${instructions}</div>
      <p style="margin-top:28px;font-size:12px;color:#5b6377">
        ${help}<br/>
        ${copyright}
      </p>
    </div>
  </body>
</html>`;
}
