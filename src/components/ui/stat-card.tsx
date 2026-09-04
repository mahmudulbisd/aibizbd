import type { ReactNode } from "react";

export type StatTone = "cyan" | "emerald" | "amber" | "rose" | "violet" | "neutral";

const iconTones: Record<StatTone, string> = {
  cyan: "bg-cyan-500/10 text-cyan-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  amber: "bg-amber-500/10 text-amber-400",
  rose: "bg-rose-500/10 text-rose-400",
  violet: "bg-violet-500/10 text-violet-400",
  neutral: "bg-white/[0.05] text-subtle",
};

const valueTones: Record<StatTone, string> = {
  cyan: "text-ink",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
  violet: "text-ink",
  neutral: "text-ink",
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
          {label}
        </span>
        {icon && (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconTones[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className={`font-mono mt-3 text-[26px] font-bold leading-none tracking-tight ${valueTones[tone]}`}>
        {value}
      </div>
      {sub && <p className="mt-2 text-xs text-faint">{sub}</p>}
    </div>
  );
}
