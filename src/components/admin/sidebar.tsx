"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  RotateCcw,
  Users,
  BarChart3,
  Store,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Ticket,
  Image as ImageIcon,
  FileText,
  Newspaper,
  HelpCircle,
  MessageSquareQuote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/returns", label: "Returns & refunds", icon: RotateCcw },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/cms-pages", label: "Pages", icon: FileText },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function openPalette() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
  }

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-line bg-surface transition-[width] duration-200 lg:block",
        collapsed ? "w-[4.5rem]" : "w-64"
      )}
    >
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
        <div className="mb-5 flex items-center gap-2 px-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-display">
            +
          </span>
          {!collapsed && (
            <span className="font-display text-sm text-ink">Admin console</span>
          )}
        </div>

        <button
          onClick={openPalette}
          className={cn(
            "mb-4 flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-sm text-ink-soft transition hover:bg-surface-soft hover:text-ink",
            collapsed && "justify-center px-0"
          )}
          aria-label="Open command palette"
        >
          <Search size={15} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </>
          )}
        </button>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-primary text-white"
                    : "text-ink-soft hover:bg-surface-soft hover:text-ink"
                )}
              >
                <item.icon size={16} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "mb-1 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-soft",
            collapsed && "justify-center px-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && "Collapse"}
        </button>

        <Link
          href="/"
          title={collapsed ? "Back to store" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-soft",
            collapsed && "justify-center px-0"
          )}
        >
          <Store size={16} />
          {!collapsed && "Back to store"}
        </Link>
      </div>
    </aside>
  );
}
