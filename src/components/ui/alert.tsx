import type { ReactNode } from "react";

type AlertTone = "info" | "warning" | "danger" | "success";

const styles: Record<AlertTone, { box: string; icon: string }> = {
  info: { box: "border-accent/25 bg-accent/[0.06] text-cyan-200", icon: "text-accent" },
  warning: { box: "border-amber-500/30 bg-amber-500/[0.08] text-amber-200", icon: "text-amber-400" },
  danger: { box: "border-rose-500/30 bg-rose-500/[0.08] text-rose-200", icon: "text-rose-400" },
  success: { box: "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-200", icon: "text-emerald-400" },
};

export function Alert({
  tone = "info",
  icon,
  title,
  children,
  action,
}: {
  tone?: AlertTone;
  icon?: ReactNode;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const s = styles[tone];
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3.5 ${s.box}`}>
      <div className="flex items-start gap-3">
        {icon && <div className={`mt-0.5 shrink-0 ${s.icon}`}>{icon}</div>}
        <div className="text-sm">
          {title && <p className="font-bold">{title}</p>}
          {children && <div className="mt-0.5 text-xs opacity-90">{children}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}
