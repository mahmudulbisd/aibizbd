import type { Metadata } from "next";
import { Terminal, Zap, Shield, HelpCircle } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { CommandCard } from "./command-card";

export const metadata: Metadata = {
  title: "Command Center & Instructions — Ai Biz BD Admin",
  description: "Developer cheatsheet, database migrations, security keys generator and API test commands.",
};

export const dynamic = "force-dynamic";

export default async function AdminCommandsPage() {
  await requireAdmin();

  return (
    <AdminShell activeTab="commands">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
            <Zap className="h-3 w-3" /> Terminal Cheatsheet
          </span>
        </div>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Command Code & <span className="text-gradient">Instructions Center</span>
        </h1>
        <p className="mt-1 text-xs text-[#8b93a7]">
          কমান্ড কোড এবং অপারেশনাল নির্দেশনাবলী — এক ক্লিকেই কমান্ড কপি করে টার্মিনালে রান করতে পারবেন।
        </p>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Database Migration */}
        <CommandCard
          title="Apply Database Schema (Migration)"
          category="DATABASE"
          badgeColor="cyan"
          description="Executes Drizzle migrations to create users, products, orders, and supplier_logs tables in your Supabase or Neon database."
          banglaInstruction="ডাটাবেজ কানেক্ট করার পর সব টেবিল (অর্ডার, প্রোডাক্ট, ইউজার) স্বয়ংক্রিয়ভাবে তৈরি করতে এই কমান্ডটি চালান।"
          command="npm run db:migrate"
          outputHint="Migrations applied. (Exits with code 0)"
        />

        {/* 2. Seed Catalog */}
        <CommandCard
          title="Seed Product Catalog into Database"
          category="DATABASE"
          badgeColor="cyan"
          description="Populates all 12 initial AI products (Gemini Pro, ChatGPT, Canva Pro, CapCut, etc.) with BDT pricing, wholesale costs and warranties."
          banglaInstruction="ডাটাবেজে ডিফল্ট ১২টি প্রোডাক্ট ক্যাটালগ ও প্রাইজ লোড করতে এই কমান্ডটি চালান।"
          command="npm run db:seed"
          outputHint="Seeded 12 products. Done."
        />

        {/* 3. Generate AES-256 Encryption Key */}
        <CommandCard
          title="Generate Master 32-Byte Encryption Key"
          category="SECURITY"
          badgeColor="emerald"
          description="Generates a cryptographically strong 32-byte base64 key for AES-256-GCM encryption of customer delivery credentials at rest."
          banglaInstruction="কাস্টমারের পাসওয়ার্ড ও লাইসেন্স কি ডাটাবেজে সিকিউর ও এনক্রিপ্টেড রাখার জন্য এই কী তৈরি করে Vercel-এ ENCRYPTION_KEY হিসেবে সেট করুন।"
          command={`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`}
          outputHint="44-character base64 string (e.g. kP8...=)"
        />

        {/* 4. Generate Auth Secret */}
        <CommandCard
          title="Generate JWT / Session Auth Secret"
          category="SECURITY"
          badgeColor="emerald"
          description="Creates a high-entropy secret key for signing customer passwordless magic links and admin session tokens."
          banglaInstruction="ম্যাজিক লিংক এবং এডমিন সেশনের নিরাপত্তার জন্য এই সিক্রেট কি তৈরি করে Vercel-এ AUTH_SECRET হিসেবে যুক্ত করুন।"
          command={`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`}
          outputHint="43-character URL-safe string"
        />

        {/* 5. End-to-End System Test */}
        <CommandCard
          title="Run Full End-to-End Checkout Test Flow"
          category="TESTING"
          badgeColor="purple"
          description="Simulates checkout, mock payment verification, instant fulfillment, encryption, delivery reveal, and order tracking without spending real money."
          banglaInstruction="পুরো সিস্টেমের চেকআউট, পেমেন্ট ও ডেলিভারি ঠিকঠাক কাজ করছে কিনা তা এক কমান্ডে টেস্ট করুন।"
          command="npm run test"
          outputHint="All flow checks passed! (Mock gateway & fulfillment)"
        />

        {/* 6. ProdSeller Balance Check */}
        <CommandCard
          title="ProdSeller Supplier Balance & Stock Check"
          category="SUPPLIER"
          badgeColor="amber"
          description="Direct API probe to check your live ProdSeller wholesale reseller balance and account status."
          banglaInstruction="ProdSeller একাউন্টের লাইভ ব্যালেন্স চেক করার কার্ল কমান্ড (YOUR_KEY-এর জায়গায় আপনার কী বসান)।"
          command={`curl -s "https://prodseller.com/api/v1/balance?api_key=YOUR_PRODSELLER_API_KEY"`}
          outputHint='{"status":"success","balance":"..."}'
        />

        {/* 7. Setup Vercel Admin Password via CLI */}
        <CommandCard
          title="Set Custom Admin Password in Vercel"
          category="VERCEL"
          badgeColor="purple"
          description="Sets a custom password for your /admin portal directly in your production Vercel environment."
          banglaInstruction="এডমিন ড্যাশবোর্ডের নিজস্ব গোপন পাসওয়ার্ড Vercel-এ যুক্ত করার কমান্ড।"
          command={`npx vercel env add ADMIN_PASSWORD production`}
          outputHint="Enter value -> Password set successfully"
        />

        {/* 8. Setup Telegram Alert Bot */}
        <CommandCard
          title="Test Telegram Admin Alert Bot"
          category="SECURITY"
          badgeColor="cyan"
          description="Sends a test ping to your Telegram channel or personal chat to verify order alert delivery."
          banglaInstruction="অর্ডার নোটিফিকেশন পাওয়ার জন্য টেলিগ্রাম বট টেস্ট করার কার্ল কমান্ড।"
          command={`curl -s -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage" -d "chat_id=YOUR_CHAT_ID&text=Ai+Biz+BD+Alert+Test"`}
          outputHint='{"ok":true,"result":{...}}'
        />
      </div>

      {/* Documentation Footer */}
      <div className="mt-10 rounded-2xl border border-white/10 bg-[#070b14]/70 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              কিভাবে নতুন এনভায়রনমেন্ট কি (Environment Variable) যুক্ত করবেন?
            </h4>
            <p className="mt-1 text-xs text-[#8b93a7]">
              Vercel ড্যাশবোর্ডে গিয়ে আপনার প্রজেক্টের <strong>Settings → Environment Variables</strong>-এ যান। সেখানে কি-নাম (যেমন: <code>ADMIN_PASSWORD</code>, <code>ENCRYPTION_KEY</code>) এবং ভ্যালু বসিয়ে <strong>Save</strong> করুন। এরপর একবার <strong>Redeploy</strong> করলেই নতুন কি কার্যকর হয়ে যাবে।
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
