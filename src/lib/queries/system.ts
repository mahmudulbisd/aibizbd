import "server-only";
import { siteConfig } from "@/lib/site";

export function getSystemDiagnostics() {
  const hasEncryptionKey = Boolean(
    process.env.ENCRYPTION_KEY &&
      Buffer.from(process.env.ENCRYPTION_KEY, "base64").length === 32,
  );

  return {
    database: {
      provider: process.env.POSTGRES_URL ? "Supabase / Neon (POSTGRES_URL)" : process.env.DATABASE_URL ? "Custom Postgres (DATABASE_URL)" : "Not Configured",
      isConfigured: Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL),
    },
    auth: {
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY),
      mode: process.env.ADMIN_PASSWORD ? "Custom Environment Key" : "Default Security Key",
    },
    encryption: {
      algorithm: "AES-256-GCM",
      isConfigured: hasEncryptionKey,
      note: hasEncryptionKey ? "32-byte master key active" : "Missing or invalid ENCRYPTION_KEY",
    },
    payments: {
      provider: process.env.PAYMENT_PROVIDER ?? "mock (Auto-verifies without live keys)",
      hasBkash: Boolean(process.env.BKASH_APP_KEY && process.env.BKASH_APP_SECRET),
      hasBinance: Boolean(process.env.BINANCE_PAY_API_KEY && process.env.BINANCE_PAY_API_SECRET),
    },
    supplier: {
      provider: process.env.FULFILLMENT_PROVIDER ?? "mock (Mock instant delivery)",
      hasProdSellerKey: Boolean(process.env.PRODSELLER_API_KEY),
    },
    alerts: {
      hasTelegramBot: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      hasTelegramChatId: Boolean(process.env.TELEGRAM_ADMIN_CHAT_ID),
      status: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID)
        ? "Active (Instant Bot Notifications)"
        : "Console Log Only (Set TELEGRAM_BOT_TOKEN & CHAT_ID to enable)",
    },
    site: {
      name: siteConfig.name,
      url: siteConfig.url,
      whatsapp: siteConfig.supportWhatsApp,
      email: siteConfig.contactEmail,
      location: siteConfig.location,
    },
  };
}
