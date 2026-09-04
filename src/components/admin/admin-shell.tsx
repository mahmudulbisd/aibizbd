"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Sliders,
  Terminal,
  ExternalLink,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import { LocaleCurrencySwitcher } from "@/components/locale-currency-switcher";
import { AdminLogoutButton } from "./admin-logout-button";

interface AdminShellProps {
  children: React.ReactNode;
  activeTab: "overview" | "orders" | "products" | "settings" | "commands";
  orderCount?: number;
}

function NavList({
  activeTab,
  orderCount,
  dict,
  onNavigate,
}: {
  activeTab: AdminShellProps["activeTab"];
  orderCount?: number;
  dict: ReturnType<typeof useI18n>["dict"];
  onNavigate?: () => void;
}) {
  const items = [
    { id: "overview" as const, label: dict.admin.overview, href: "/admin", icon: LayoutDashboard },
    { id: "orders" as const, label: dict.admin.orders, href: "/admin/orders", icon: ShoppingCart },
    { id: "products" as const, label: dict.admin.products, href: "/admin/products", icon: Package },
    { id: "settings" as const, label: dict.admin.settings, href: "/admin/settings", icon: Sliders },
    { id: "commands" as const, label: dict.admin.commands, href: "/admin/commands", icon: Terminal },
  ];

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-white/[0.07] text-ink"
                : "text-subtle hover:bg-white/[0.04] hover:text-ink"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-faint"}`} />
            <span>{item.label}</span>
            {item.id === "orders" && orderCount !== undefined && orderCount > 0 && (
              <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-subtle">
                {orderCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children, activeTab, orderCount }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dict } = useI18n();

  return (
    <div className="min-h-dvh bg-background text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-panel/60 backdrop-blur lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-tight text-ink">
              Ai Biz BD
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {dict.admin.consoleName}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
          <NavList activeTab={activeTab} orderCount={orderCount} dict={dict} />
          {/* Locale toggle (currency stays BDT in admin) */}
          <div className="mt-4 border-t border-line pt-4">
            <LocaleCurrencySwitcher showCurrency={false} />
          </div>
        </div>
        <div className="border-t border-line p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-subtle transition hover:bg-white/[0.04] hover:text-ink"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {dict.admin.liveStorefront}
          </Link>
          <div className="mt-1 px-3">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-background/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display text-sm font-bold text-ink">{dict.admin.consoleName}</span>
        </div>
        <div className="flex items-center gap-2">
          <LocaleCurrencySwitcher showCurrency={false} />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg border border-line p-2 text-subtle"
            aria-label={dict.nav.toggleMenu}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="border-b border-line bg-panel px-4 py-3 lg:hidden">
          <NavList
            activeTab={activeTab}
            orderCount={orderCount}
            dict={dict}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
