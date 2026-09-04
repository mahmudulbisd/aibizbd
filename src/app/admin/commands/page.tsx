import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { CommandCard } from "./command-card";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: `${dict.admin.commandsTitle} — Ai Biz BD Admin`,
    description: dict.admin.commandsSub,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminCommandsPage() {
  await requireAdmin();
  const { dict } = await getI18n();

  return (
    <AdminShell activeTab="commands">
      <PageHeader
        eyebrow={dict.admin.commandsEyebrow}
        title={dict.admin.commandsTitle}
        description={dict.admin.commandsSub}
      />

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CommandCard
          title="Apply Database Schema (Migration)"
          category="DATABASE"
          badgeColor="cyan"
          description="Executes Drizzle migrations to create users, products, orders, and supplier_logs tables in your Supabase or Neon database."
          instruction="Run this after connecting your database to create every table (orders, products, users) automatically."
          command="npm run db:migrate"
          outputHint="Migrations applied. (Exits with code 0)"
        />

        <CommandCard
          title="Seed Product Catalog into Database"
          category="DATABASE"
          badgeColor="cyan"
          description="Populates all 12 initial AI products (Gemini Pro, ChatGPT, Canva Pro, CapCut, etc.) with BDT pricing, wholesale costs and warranties."
          instruction="Run this to load the default 12-product catalog with pricing into the database."
          command="npm run db:seed"
          outputHint="Seeded 12 products. Done."
        />

        <CommandCard
          title="Generate Master 32-Byte Encryption Key"
          category="SECURITY"
          badgeColor="emerald"
          description="Generates a cryptographically strong 32-byte base64 key for AES-256-GCM encryption of customer delivery credentials at rest."
          instruction="Generate this key to keep customer passwords and license keys securely encrypted, then set it as ENCRYPTION_KEY in Vercel."
          command={`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`}
          outputHint="44-character base64 string (e.g. kP8...=)"
        />

        <CommandCard
          title="Generate JWT / Session Auth Secret"
          category="SECURITY"
          badgeColor="emerald"
          description="Creates a high-entropy secret key for signing customer passwordless magic links and admin session tokens."
          instruction="Generate this secret to secure magic links and admin sessions, then add it as AUTH_SECRET in Vercel."
          command={`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`}
          outputHint="43-character URL-safe string"
        />

        <CommandCard
          title="Run Full End-to-End Checkout Test Flow"
          category="TESTING"
          badgeColor="purple"
          description="Simulates checkout, mock payment verification, instant fulfillment, encryption, delivery reveal, and order tracking without spending real money."
          instruction="Run this one command to verify checkout, payment and delivery all work end to end."
          command="npm run test"
          outputHint="All flow checks passed! (Mock gateway & fulfillment)"
        />

        <CommandCard
          title="ProdSeller Supplier Balance & Stock Check"
          category="SUPPLIER"
          badgeColor="amber"
          description="Direct API probe to check your live ProdSeller wholesale reseller balance and account status."
          instruction="Curl command to check your live ProdSeller balance (replace YOUR_KEY with your actual key)."
          command={`curl -s "https://prodseller.com/api/v1/balance?api_key=YOUR_PRODSELLER_API_KEY"`}
          outputHint='{"status":"success","balance":"..."}'
        />

        <CommandCard
          title="Set Custom Admin Password in Vercel"
          category="VERCEL"
          badgeColor="purple"
          description="Sets a custom password for your /admin portal directly in your production Vercel environment."
          instruction="Command to add your own secret admin dashboard password in Vercel."
          command={`npx vercel env add ADMIN_PASSWORD production`}
          outputHint="Enter value -> Password set successfully"
        />

        <CommandCard
          title="Test Telegram Admin Alert Bot"
          category="SECURITY"
          badgeColor="cyan"
          description="Sends a test ping to your Telegram channel or personal chat to verify order alert delivery."
          instruction="Curl command to test the Telegram bot for order notifications."
          command={`curl -s -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage" -d "chat_id=YOUR_CHAT_ID&text=Ai+Biz+BD+Alert+Test"`}
          outputHint='{"ok":true,"result":{...}}'
        />
      </div>

      {/* Documentation Footer */}
      <Card className="mt-8 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">{dict.admin.commandsFooterTitle}</h4>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              {dict.admin.commandsFooterBody}
            </p>
          </div>
        </div>
      </Card>
    </AdminShell>
  );
}
