import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export function AccountShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-tight">Ai Biz BD</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                My Account
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-subtle sm:inline-block">
              {email}
            </span>
            <Link
              href="/#products"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-subtle transition hover:text-ink"
            >
              <ArrowLeft className="h-3 w-3" />
              Browse store
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
