"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  CornerDownLeft,
  Ticket,
  Image as ImageIcon,
  FileText,
  Newspaper,
  HelpCircle,
  MessageSquareQuote,
} from "lucide-react";
import { withReducedMotion, fadeIn, scaleIn } from "@/lib/motion";

const COMMANDS = [
  { label: "Dashboard overview", href: "/admin", icon: LayoutDashboard, keywords: "home stats" },
  { label: "Products", href: "/admin/products", icon: Package, keywords: "catalog inventory" },
  { label: "Add new product", href: "/admin/products/new", icon: Package, keywords: "create new" },
  { label: "Categories", href: "/admin/categories", icon: Tags, keywords: "aisles" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, keywords: "sales" },
  { label: "Returns & refunds", href: "/admin/returns", icon: RotateCcw, keywords: "rma" },
  { label: "Customers", href: "/admin/customers", icon: Users, keywords: "users accounts" },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket, keywords: "discounts promo codes" },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon, keywords: "homepage promo slider" },
  { label: "Pages", href: "/admin/cms-pages", icon: FileText, keywords: "cms content static" },
  { label: "Blog", href: "/admin/blog", icon: Newspaper, keywords: "posts articles content" },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle, keywords: "questions homepage" },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote, keywords: "reviews quotes homepage" },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, keywords: "analytics revenue" },
  { label: "Back to storefront", href: "/", icon: Store, keywords: "shop exit" },
];

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const reduced = !!useReducedMotion();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.keywords.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      go(results[activeIndex].href);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={withReducedMotion(fadeIn, reduced)}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            variants={withReducedMotion(scaleIn, reduced)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-panel border border-line bg-surface shadow-elevated"
          >
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-3.5">
              <Search size={16} className="text-ink-soft" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Jump to a section..."
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
                Esc
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-ink-soft">
                  No matches for &ldquo;{query}&rdquo;
                </p>
              )}
              {results.map((cmd, i) => (
                <button
                  key={cmd.href}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => go(cmd.href)}
                  className={
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition " +
                    (i === activeIndex
                      ? "bg-primary text-white"
                      : "text-ink hover:bg-surface-soft")
                  }
                >
                  <cmd.icon size={15} />
                  <span className="flex-1">{cmd.label}</span>
                  {i === activeIndex && <CornerDownLeft size={13} />}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
