import type { OrderStatus } from "@/lib/types";

export type BadgeTone =
  | "neutral"
  | "cyan"
  | "emerald"
  | "blue"
  | "purple"
  | "violet"
  | "amber"
  | "rose";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-white/[0.06] text-subtle border border-line",
  cyan: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/25",
  emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  blue: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
  purple: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
  violet: "bg-violet-500/10 text-violet-400 border border-violet-500/25",
  amber: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
  rose: "bg-rose-500/10 text-rose-400 border border-rose-500/25",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const statusTone: Record<OrderStatus, BadgeTone> = {
  DELIVERED: "emerald",
  PAID: "blue",
  PROCESSING: "purple",
  PENDING: "amber",
  FAILED: "rose",
  REFUNDED: "rose",
};

export function StatusBadge({ status }: { status: OrderStatus | string }) {
  const tone = statusTone[status as OrderStatus] ?? "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

export function PaymentBadge({ method }: { method: string }) {
  return <Badge tone="neutral">{method.replaceAll("_", " ")}</Badge>;
}
