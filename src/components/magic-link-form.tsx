"use client";

import { useState } from "react";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { useI18n } from "@/components/locale-provider";

export function MagicLinkForm() {
  const { signIn } = useAuth();
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [devMagicUrl, setDevMagicUrl] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(dict.auth.errorEmail);
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    const res = await signIn(email);
    if (!res.ok) {
      setState("error");
      setError(res.error === "EMAIL_FAILED" ? dict.auth.errorSend : dict.auth.errorGeneric);
      return;
    }
    // Dev builds return the magic link so the flow is demoable without email.
    const data = res as { devMagicUrl?: string };
    setDevMagicUrl(data.devMagicUrl ?? null);
    setState("sent");
  }

  if (state === "sent") {
    const sentBody = dict.auth.sentBody.replace("{email}", email);
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <MailCheck className="mx-auto text-emerald-400" size={32} />
        <h2 className="font-display mt-4 text-xl font-bold">{dict.auth.sentTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#8b93a7]">{sentBody}</p>
        {devMagicUrl && (
          <a
            href={devMagicUrl}
            className="btn-neon mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          >
            {dict.auth.devLink} <ArrowRight size={15} />
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card rounded-2xl p-8">
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#8b93a7]">
        {dict.auth.emailLabel}
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setState("idle");
        }}
        placeholder={dict.auth.emailPlaceholder}
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
            <Loader2 size={16} className="animate-spin" /> {dict.auth.sending}
          </>
        ) : (
          dict.auth.submit
        )}
      </button>
      <p className="mt-4 text-center text-xs leading-relaxed text-[#5b6377]">
        {dict.auth.footnote}
      </p>
    </form>
  );
}
