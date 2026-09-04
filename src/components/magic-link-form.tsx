"use client";

import { useState } from "react";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/components/auth-context";

export function MagicLinkForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [devMagicUrl, setDevMagicUrl] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    const res = await signIn(email);
    if (!res.ok) {
      setState("error");
      setError(res.error === "EMAIL_FAILED" ? "Could not send the email — try again." : "Something went wrong.");
      return;
    }
    // Dev builds return the magic link so the flow is demoable without email.
    const data = res as { devMagicUrl?: string };
    setDevMagicUrl(data.devMagicUrl ?? null);
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <MailCheck className="mx-auto text-emerald-400" size={32} />
        <h2 className="font-display mt-4 text-xl font-bold">Check your inbox</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#8b93a7]">
          We sent a secure sign-in link to <span className="text-white">{email}</span>.
          {!devMagicUrl && " Click it to open your dashboard."}
        </p>
        {devMagicUrl && (
          <a
            href={devMagicUrl}
            className="btn-neon mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          >
            Open sign-in link (dev) <ArrowRight size={15} />
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card rounded-2xl p-8">
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#8b93a7]">
        Email address
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setState("idle");
        }}
        placeholder="you@example.com"
        autoComplete="email"
        className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-[#5b6377] outline-none transition focus:border-cyan-500/50"
      />
      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={state === "loading"}
        className="btn-neon mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white disabled:opacity-60"
      >
        {state === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending…
          </>
        ) : (
          "Email me a sign-in link"
        )}
      </button>
      <p className="mt-4 text-center text-xs leading-relaxed text-[#5b6377]">
        No password needed. Orders you place with this email appear in your dashboard.
      </p>
    </form>
  );
}
