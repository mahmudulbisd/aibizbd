"use client";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

const COLOR_MAP: Record<string, string> = {
  emerald: "#34d399",
  blue: "#60a5fa",
  purple: "#a78bfa",
  amber: "#fbbf24",
  rose: "#fb7185",
};

export function DonutChart({
  segments,
  centerLabel,
}: {
  segments: DonutSegment[];
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-xs text-faint">
        No orders in this range.
      </div>
    );
  }

  const R = 60;
  const C = 2 * Math.PI * R;

  // Precompute each segment's dash + offset in a single pass (pure).
  const arcs = segments.reduce<
    { label: string; value: number; color: string; dash: number; gap: number; offset: number }[]
  >((list, s) => {
    const prevOffset = list.length > 0 ? list[list.length - 1].offset : 0;
    const frac = s.value / total;
    const dash = frac * C;
    const offset = prevOffset - frac * C;
    return [...list, { ...s, dash: Math.max(dash - 2, 0.5), gap: C - dash + 2, offset }];
  }, []);

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="Order status split">
          <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
          {arcs.map((s, i) => (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              transform="rotate(-90 80 80)"
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-ink">{total}</span>
          {centerLabel && <span className="text-[10px] uppercase tracking-wider text-faint">{centerLabel}</span>}
        </div>
      </div>
      <ul className="space-y-2">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-subtle">{s.label}</span>
            <span className="font-mono font-bold text-ink">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { COLOR_MAP };
