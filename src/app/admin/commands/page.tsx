import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { CommandCard } from "./command-card";

export const metadata: Metadata = {
  title: "Command Center — Ai Biz BD Admin",
  description: "Developer cheatsheet, database migrations, security keys and API test commands.",
};

export const dynamic = "force-dynamic";

export default async function AdminCommandsPage() {
  await requireAdmin();

  return (
    <AdminShell activeTab="commands">
      <PageHeader
        eyebrow="Runbook"
        title="Command Center"
        description="কমান্ড কোড এবং অপারেশনাল নির্দেশনাবলী — এক ক্লিকেই কমান্ড কপি করে টার্মিনালে রান করতে পারবেন।"
      />

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CommandCard
          title="Apply Database Schema (Migration)"
          category="DATABASE"
          badgeColor="cyan"
          description="Executes Drizzle migrations to create users, products, orders, and supplier_logs tables in your Supabase or Neon database."
          banglaInstruction="ডাটাবেজ কানেক্ট করার পর সব টেবিল (অর্ডার, প্রোডাক্ট, ইউজার) স্বয়ংক্রিয়ভাবে তৈরি করতে এই কমান্ডটি চালান।"
          command="npm run db:migrate"
          outputHint="Migrations applied. (Exits with code 0)"
        />

        <CommandCard
          title="Seed Product Catalog into Database"
          category="DATABASE"
          badgeColor="cyan"
          description="Populates all 12 initial AI products (Gemini Pro, ChatGPT, Canva Pro, CapCut, etc.) with BDT pricing, wholesale costs and warranties."
          banglaInstruction="ডাটাবেজে ডিফল্ট ১২টি প্রোডাক্ট ক্যাটালগ ও প্রাইজ লোড করতে এই কমান্ডটি চালান।"
          command="npm run db:seed"
          outputHint="Seeded 12 products. Done."
        />

        <CommandCard
          title="Generate Master 32-Byte Encryption Key"
          category="SECURITY"
          badgeColor="emerald"
          description="Generates a cryptographically strong 32-byte base64 key for AES-256-GCM encryption of customer delivery credentials at rest."
          banglaInstruction="কাস্টমারের পাসওয়ার্ড ও লাইসেন্স কি ডাটাবেজে সিকিউর ও এনক্রিপ্টেড রাখার জন্য এই কী তৈরি করে Vercel-এ ENCRYPTION_KEY হিসেবে সেট করুন।"
          command={`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`}
          outputHint="44-character base64 string (e.g. kP8...=)"
        />

        <CommandCard
          title="Generate JWT / Session Auth Secret"
          category="SECURITY"
          badgeColor="emerald"
          description="Creates a high-entropy secret key for signing customer passwordless magic links and admin session tokens."
          banglaInstruction="ম্যাজিক লিংক এবং এডমিন সেশনের নিরাপত্তার জন্য এই সিক্রেট কি তৈরি করে Vercel-এ AUTH_SECRET হিসেবে যুক্ত করুন।"
          command={`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`}
          outputHint="43-character URL-safe string"
        />

        <CommandCard
          title="Run Full End-to-End Checkout Test Flow"
          category="TESTING"
          badgeColor="purple"
          description="Simulates checkout, mock payment verification, instant fulfillment, encryption, delivery reveal, and order tracking without spending real money."
          banglaInstruction="পুরো সিস্টেমের চেকআউট, পেমেন্ট ও ডেলিভারি ঠিকঠাক কাজ করছে কিনা তা এক কমান্ডে টেস্ট করুন।"
          command="npm run test"
          outputHint="All flow checks passed! (Mock gateway & fulfillment)"
        />

        <CommandCard
          title="ProdSeller Supplier Balance & Stock Check"
          category="SUPPLIER"
          badgeColor="amber"
          description="Direct API probe to check your live ProdSeller wholesale reseller balance and account status."
          banglaInstruction="ProdSeller একাউন্টের লাইভ ব্যালেন্স চেক করার কার্ল কমান্ড (YOUR_KEY-এর জায়গায় আপনার কী বসান)।"
          command={`curl -s "https://prodseller.com/api/v1/balance?api_key=YOUR_PRODSELLER_API_KEY"`}
          outputHint='{"status":"success","balance":"..."}'
        />

        <CommandCard
          title="Set Custom Admin Password in Vercel"
          category="VERCEL"
          badgeColor="purple"
          description="Sets a custom password for your /admin portal directly in your production Vercel environment."
          banglaInstruction="এডমিন ড্যাশবোর্ডের নিজস্ব গোপন পাসওয়ার্ড Vercel-এ যুক্ত করার কমান্ড।"
          command={`npx vercel env add ADMIN_PASSWORD production`}
          outputHint="Enter value -> Password set successfully"
        />

        <CommandCard
          title="Test Telegram Admin Alert Bot"
          category="SECURITY"
          badgeColor="cyan"
          description="Sends a test ping to your Telegram channel or personal chat to verify order alert delivery."
          banglaInstruction="অর্ডার নোটিফিকেশন পাওয়ার জন্য টেলিগ্রাম বট টেস্ট করার কার্ল কমান্ড।"
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
            <h4 className="text-sm font-bold text-ink">
              কিভাবে নতুন এনভায়রনমেন্ট কি (Environment Variable) যুক্ত করবেন?
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              Vercel ড্যাশবোর্ডে গিয়ে আপনার প্রজেক্টের <strong className="text-ink">Settings → Environment Variables</strong>-এ যান। সেখানে কি-নাম (যেমন: <code className="rounded border border-line bg-panel-strong px-1 font-mono text-accent">ADMIN_PASSWORD</code>, <code className="rounded border border-line bg-panel-strong px-1 font-mono text-accent">ENCRYPTION_KEY</code>) এবং ভ্যালু বসিয়ে <strong className="text-ink">Save</strong> করুন। এরপর একবার <strong className="text-ink">Redeploy</strong> করলেই নতুন কি কার্যকর হয়ে যাবে।
            </p>
          </div>
        </div>
      </Card>
    </AdminShell>
  );
}
