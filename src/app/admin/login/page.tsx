import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin";
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
    <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-16">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#070b14]/80 p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-inner shadow-cyan-500/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-[11px] font-medium tracking-wider uppercase text-cyan-300">
            Protected Zone
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white tracking-tight">
            Ai Biz BD <span className="text-gradient">Admin</span>
          </h1>
          <p className="mt-1.5 text-xs text-[#8b93a7]">
            Enter your secret key or password to manage orders, settings & commands.
          </p>
        </div>

        <div className="mt-8">
          <AdminLoginForm />
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-[11px] text-[#6b7280]">
            Ai Biz BD Automated Reseller Architecture · Dhaka, BD
          </p>
        </div>
      </div>
    </div>
  );
}
