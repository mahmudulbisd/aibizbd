"use client";

import { useId, useState } from "react";
import { formatBDT } from "@/lib/site";

interface Point {
  date: string;
  value: number;
  secondary?: number;
}

function fmtShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Simple dependency-free SVG area chart with gradient fill + hover. */
export function AreaChart({
  data,
  height = 200,
  color = "#22d3ee",
}: {
  data: Point[];
  height?: number;
  color?: string;
}) {
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = height;
  const PAD = 8;

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-xs text-faint">
        No data for this range yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const step = (W - PAD * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({
    x: PAD + i * step,
    y: H - PAD - (d.value / max) * (H - PAD * 2),
    ...d,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${H - PAD} L${pts[0].x},${H - PAD} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Revenue trend"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 4 : 2.5}
            fill={hover === i ? color : "#0c1019"}
            stroke={color}
            strokeWidth="1.5"
            className="cursor-pointer"
            onMouseEnter={() => setHover(i)}
          />
        ))}
        {hover !== null && pts[hover] && (
          <g>
            <line
              x1={pts[hover].x}
              y1={PAD}
              x2={pts[hover].x}
              y2={H - PAD}
              stroke={color}
              strokeOpacity="0.3"
              strokeDasharray="3 3"
            />
            <rect
              x={Math.min(Math.max(pts[hover].x - 60, 0), W - 130)}
              y={PAD - 4}
              width="130"
              height="34"
              rx="6"
              fill="#10151f"
              stroke="rgba(255,255,255,0.1)"
            />
            <text
              x={Math.min(Math.max(pts[hover].x - 60, 0) + 65, W - 65)}
              y={PAD + 12}
              textAnchor="middle"
              fontSize="10"
              fill="#22d3ee"
              fontFamily="JetBrains Mono, monospace"
            >
              {formatBDT(pts[hover].value)}
            </text>
            <text
              x={Math.min(Math.max(pts[hover].x - 60, 0) + 65, W - 65)}
              y={PAD + 24}
              textAnchor="middle"
              fontSize="9"
              fill="#98a1b3"
            >
              {fmtShort(pts[hover].date)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
