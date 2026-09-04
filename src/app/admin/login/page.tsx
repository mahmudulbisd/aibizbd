import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Admin Sign In — Ai Biz BD",
  description: "Secure administrator authentication portal.",
};

export default async function AdminLoginPage() {
  const authed = await isAdminAuthenticated();
  if (authed) {
    redirect("/admin");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-[120px]" />

      <Card className="relative w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle">
            Protected zone
          </span>
          <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-ink">
            Admin Console
          </h1>
          <p className="mt-1.5 text-xs text-subtle">
            Enter your secret key or password to manage orders, products and settings.
          </p>
        </div>

        <div className="mt-8">
          <AdminLoginForm />
        </div>

        <div className="mt-8 border-t border-line pt-4 text-center">
          <p className="text-[11px] text-faint">
            Ai Biz BD Automated Reseller Architecture · Dhaka, BD
          </p>
        </div>
      </Card>
    </div>
  );
}
