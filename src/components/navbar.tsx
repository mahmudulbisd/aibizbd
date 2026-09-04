"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, Menu, ShoppingCart, UserRound, X, Zap } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/components/auth-context";
import { useI18n } from "@/components/locale-provider";
import { LocaleCurrencySwitcher } from "@/components/locale-currency-switcher";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { hasItem, openCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { dict } = useI18n();

  const navItems = [
    { label: dict.nav.products, href: "/#products" },
    { label: dict.nav.myAccount, href: "/dashboard" },
    { label: dict.nav.trackOrder, href: "/order" },
    { label: dict.nav.support, href: "https://wa.me/8801735993166" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600">
            <Zap className="h-4 w-4 text-white" size={16} />
          </span>
          <span className="font-display text-lg">
            Ai<span className="text-gradient">Biz</span> BD
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[#aab3c5] md:flex">
          {navItems.map((item) =>
            item.href.startsWith("http") ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-cyan-300"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="transition hover:text-cyan-300"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          {/* Language + currency switcher (desktop) */}
          <div className="hidden md:block">
            <LocaleCurrencySwitcher />
          </div>

          {/* Cart */}
          <button
            type="button"
            onClick={openCart}
            disabled={!hasItem}
            aria-label={dict.nav.openCart}
            title={hasItem ? dict.nav.openCart : dict.nav.cartEmpty}
            className={`relative rounded-xl border p-2.5 transition ${
              hasItem
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_18px_-4px_rgba(6,182,212,0.7)] hover:bg-cyan-500/20"
                : "border-white/[0.08] bg-white/[0.03] text-[#5b6377]"
            }`}
          >
            <ShoppingCart size={18} />
            {hasItem && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 px-1 text-[10px] font-bold text-white shadow-lg">
                1
              </span>
            )}
          </button>

          {/* Account / Sign in */}
          {!authLoading &&
            (user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm font-semibold text-[#aab3c5] transition hover:border-violet-500/40 hover:text-violet-300"
              >
                <UserRound size={16} className="text-violet-400" />
                <span className="hidden sm:inline">{dict.nav.myAccount}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm font-semibold text-[#aab3c5] transition hover:border-cyan-500/40 hover:text-cyan-300"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">{dict.nav.signIn}</span>
              </Link>
            ))}

          <button
            type="button"
            aria-label={dict.nav.toggleMenu}
            className="rounded-lg p-2 text-[#aab3c5] hover:text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/[0.06] bg-[#0a0d15]/95 px-4 py-4 md:hidden">
          {navItems.map((item) =>
            item.href.startsWith("http") ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="block py-2 text-sm text-[#aab3c5] hover:text-cyan-300"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="block py-2 text-sm text-[#aab3c5] hover:text-cyan-300"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
          <div className="mt-3 border-t border-white/[0.06] pt-3">
            <LocaleCurrencySwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
