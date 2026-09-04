import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Sliders,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AdminLogoutButton } from "./admin-logout-button";

interface AdminShellProps {
  children: React.ReactNode;
  activeTab: "overview" | "orders" | "products" | "settings" | "commands";
  orderCount?: number;
}

export function AdminShell({ children, activeTab, orderCount }: AdminShellProps) {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "orders",
      label: "Orders Manager",
      href: "/admin/orders",
      icon: ShoppingCart,
      badge: orderCount !== undefined ? String(orderCount) : null,
    },
    {
      id: "products",
      label: "Catalog & Margins",
      href: "/admin/products",
      icon: Package,
      badge: null,
    },
    {
      id: "settings",
      label: "Site & Auth Settings",
      href: "/admin/settings",
      icon: Sliders,
      badge: null,
    },
    {
      id: "commands",
      label: "Command Code Center",
      href: "/admin/commands",
      icon: Terminal,
      badge: "PRO",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-white">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-white text-base tracking-tight">
                  Ai Biz BD
                </span>
                <span className="inline-flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </span>
              </div>
              <p className="text-[11px] text-[#8b93a7]">Control Center & Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-[#c3cad8] transition hover:bg-white/10 hover:text-white sm:flex"
            >
              <span>Live Storefront</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <nav className="no-scrollbar mb-8 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 shadow-sm shadow-cyan-500/10"
                    : "border border-white/5 bg-[#0d121f]/60 text-[#8b93a7] hover:border-white/10 hover:bg-[#0d121f] hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-[#6b7280]"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-300"
                        : "bg-white/10 text-[#8b93a7]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <main>{children}</main>
      </div>
    </div>
  );
}
