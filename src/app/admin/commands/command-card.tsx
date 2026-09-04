"use client";

import { useState } from "react";
import { Terminal } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface CommandCardProps {
  title: string;
  category: "DATABASE" | "SECURITY" | "TESTING" | "SUPPLIER" | "VERCEL";
  badgeColor?: "cyan" | "emerald" | "purple" | "amber";
  description: string;
  banglaInstruction?: string;
  command: string;
  outputHint?: string;
}

const badgeTone: Record<string, BadgeTone> = {
  cyan: "cyan",
  emerald: "emerald",
  purple: "purple",
  amber: "amber",
};

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

  return (
    <Card className="flex flex-col p-5">
      <div>
        <div className="flex items-center justify-between">
          <Badge tone={badgeTone[badgeColor] ?? "cyan"}>
            <Terminal className="h-3 w-3" />
            {category}
          </Badge>
        </div>

        <h3 className="mt-3 text-sm font-bold tracking-tight text-ink">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-subtle">{description}</p>

        {banglaInstruction && (
          <div className="mt-2.5 rounded-lg border border-accent/20 bg-accent/[0.04] px-3 py-2 text-[11px] leading-relaxed text-cyan-200/90">
            <strong>নির্দেশনা:</strong> {banglaInstruction}
          </div>
        )}

        {/* Code snippet */}
        <div className="relative mt-3 rounded-lg border border-line bg-black/40 p-3 font-mono text-xs leading-relaxed text-cyan-300">
          <div className="select-all overflow-x-auto whitespace-pre-wrap break-all pr-9">
            {command}
          </div>
          <div className="absolute right-2 top-2">
            <CopyButton text={command} label="" />
          </div>
        </div>

        {outputHint && (
          <p className="mt-2 font-mono text-[10px] text-faint">Expected result: {outputHint}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <span className="text-[10px] text-faint">Run in Terminal or Cloud Shell</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-[11px] font-semibold text-accent transition hover:text-cyan-200"
        >
          {copied ? "Copied to Clipboard!" : "Copy Command"}
        </button>
      </div>
    </Card>
  );
}
