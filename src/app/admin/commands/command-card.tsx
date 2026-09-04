"use client";

import { useState } from "react";
import { Copy, Check, Terminal, Play } from "lucide-react";

interface CommandCardProps {
  title: string;
  category: "DATABASE" | "SECURITY" | "TESTING" | "SUPPLIER" | "VERCEL";
  badgeColor?: "cyan" | "emerald" | "purple" | "amber";
  description: string;
  banglaInstruction?: string;
  command: string;
  outputHint?: string;
}

export function CommandCard({
  title,
  category,
  badgeColor = "cyan",
  description,
  banglaInstruction,
  command,
  outputHint,
}: CommandCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const badgeStyles = {
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  }[badgeColor];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d121f]/90 p-5 shadow-xl transition hover:border-white/20">
      <div>
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${badgeStyles}`}
          >
            <Terminal className="h-3 w-3" />
            {category}
          </span>
        </div>

        <h3 className="mt-3 text-sm font-bold text-white tracking-tight">{title}</h3>
        <p className="mt-1 text-xs text-[#8b93a7]">{description}</p>

        {banglaInstruction && (
          <div className="mt-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[11px] text-cyan-300">
            <strong>নির্দেশনা:</strong> {banglaInstruction}
          </div>
        )}

        {/* Code Snippet Box */}
        <div className="relative mt-3 rounded-xl border border-black/60 bg-[#070a12] p-3 font-mono text-xs text-cyan-300">
          <div className="overflow-x-auto whitespace-pre-wrap break-all pr-8 select-all">
            {command}
          </div>
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 rounded-lg border border-white/10 bg-white/5 p-1.5 text-[#8b93a7] transition hover:bg-white/10 hover:text-white"
            title="Copy Command"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {outputHint && (
          <p className="mt-2 font-mono text-[10px] text-[#6b7280]">
            Expected result: {outputHint}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-[10px] text-[#8b93a7]">Run in Terminal or Cloud Shell</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 transition hover:underline"
        >
          {copied ? "Copied to Clipboard!" : "Copy Command"}
        </button>
      </div>
    </div>
  );
}
