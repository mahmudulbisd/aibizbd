import Link from "next/link";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition select-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  // Light Linear-style primary button.
  primary: "bg-ink text-[#0a0d14] hover:brightness-110 shadow-sm",
  secondary: "border border-line bg-white/[0.04] text-ink hover:bg-white/[0.08] hover:border-line-strong",
  ghost: "text-subtle hover:text-ink hover:bg-white/[0.05]",
  danger: "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
};

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
};

export interface ButtonProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  target?: string;
  type?: "button" | "submit";
  form?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  title?: string;
}

export function Button({
  variant = "secondary",
  size = "md",
  href,
  target,
  type = "button",
  form,
  loading,
  disabled,
  onClick,
  className = "",
  children,
  title,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} target={target} className={cls} onClick={onClick} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} form={form} onClick={onClick} disabled={disabled || loading} className={cls} title={title}>
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}
