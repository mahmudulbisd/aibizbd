"use client";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-panel p-1">
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wider transition ${
              active
                ? "bg-white/[0.08] text-ink shadow-sm"
                : "text-faint hover:text-subtle"
            }`}
          >
            {item.label}
            {item.badge !== undefined && item.badge !== null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  active ? "bg-accent/20 text-cyan-300" : "bg-white/[0.06] text-faint"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
