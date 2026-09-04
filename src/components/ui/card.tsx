import type { ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-xl border border-line bg-panel ${className}`}>{children}</div>
  );
}

export function CardHeader({
  icon,
  title,
  description,
  action,
  iconClassName = "bg-white/[0.04] text-accent",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-subtle">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
