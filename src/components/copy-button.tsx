"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/components/locale-provider";

export function CopyButton({
  text,
  label,
}: {
  text: string;
  label?: string;
}) {
  const { dict } = useI18n();
  const [copied, setCopied] = useState(false);
  const resolvedLabel = label ?? dict.common.copy;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / non-secure contexts.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-[#aab3c5] transition hover:bg-cyan-500/15 hover:text-cyan-300"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      {copied ? dict.common.copied : resolvedLabel}
    </button>
  );
}
