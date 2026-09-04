"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, KeyRound, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Incorrect password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa3b6]">
          Admin Secret Key or Password
        </label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            placeholder="••••••••••••••••"
            className="w-full rounded-xl border border-white/10 bg-[#0d121f]/90 px-4 py-3 pl-11 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
          />
          <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-400" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Authenticated! Redirecting to command center…</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success || !password}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying…</span>
          </>
        ) : (
          <>
            <span>Enter Admin Portal</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
