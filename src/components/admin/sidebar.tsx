"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  RotateCcw,
  Users,
  BarChart3,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/returns", label: "Returns & refunds", icon: RotateCcw },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-5">
        <div className="mb-6 flex items-center gap-2 px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-display">
            +
          </span>
          <span className="font-display text-sm text-ink">Admin console</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary text-white"
                    : "text-ink-soft hover:bg-surface-soft hover:text-ink"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-soft"
        >
          <Store size={16} /> Back to store
        </Link>
      </div>
    </aside>
  );
}
