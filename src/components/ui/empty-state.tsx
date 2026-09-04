import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-panel/50 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-faint">{icon}</div>}
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-subtle">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
