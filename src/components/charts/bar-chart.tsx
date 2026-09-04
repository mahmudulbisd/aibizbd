"use client";

import { useId } from "react";

interface Bar {
  label: string;
  value: number;
}

/** Compact dependency-free vertical bar chart (orders / counts). */
export function BarChart({
  data,
  height = 160,
  color = "#818cf8",
}: {
  data: Bar[];
  height?: number;
  color?: string;
}) {
  const gid = useId();
  const W = 640;
  const H = height;
  const PAD = 6;

  if (data.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center text-xs text-faint">
        No data for this range yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = Math.max((W - PAD * 2) / data.length - 6, 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Orders per day">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * (H - PAD * 2 - 14), d.value > 0 ? 3 : 1);
        const x = PAD + i * ((W - PAD * 2) / data.length) + 3;
        const y = H - PAD - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={bw}
              height={h}
              rx="3"
              fill={`url(#${gid})`}
              className="transition-opacity hover:opacity-80"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}
