import type { ReactNode } from "react";

export const controlCls =
  "w-full rounded-lg border border-line bg-panel-strong px-3.5 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-subtle">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-faint">{hint}</p>}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
