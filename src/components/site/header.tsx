"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Moon,
  Sun,
  LayoutDashboard,
  Package,
  LogOut,
  ChevronDown,
  Heart,
} from "lucide-react";
import { useCart, cartCount } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { scaleIn, withReducedMotion } from "@/lib/motion";
import type { Category } from "@/types";

export function Header({ categories }: { categories: Category[] }) {
  const navLinks = categories
    .slice(0, 6)
    .map((c) => ({ label: c.name, href: `/shop?category=${c.slug}` }));
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const wishlistCount = useWishlist((s) => s.lines.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement>(null);
  const count = cartCount(lines);
  const reduced = !!useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/shop${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setMobileOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md transition-shadow",
        scrolled && "shadow-[0_1px_0_0_var(--line)]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          className="-ml-2 rounded-lg p-2 text-ink lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-display text-lg">
            +
          </span>
          <span className="font-display text-xl tracking-tight text-ink">
            HH <span className="text-primary">Medics</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-surface-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={handleSearch}
          className="ml-auto hidden max-w-sm flex-1 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 shadow-card transition-shadow focus-within:shadow-elevated md:flex"
        >
          <Search size={16} className="text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines, serums, vitamins..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/60"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            onClick={toggle}
            className="rounded-full p-2.5 text-ink-soft transition hover:bg-surface-soft hover:text-ink"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <Link
            href="/wishlist"
            className="relative hidden rounded-full p-2.5 text-ink-soft transition hover:bg-surface-soft hover:text-ink sm:block"
            aria-label="Wishlist"
          >
            <Heart size={19} />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={reduced ? { duration: 0.01 } : { type: "spring", damping: 15, stiffness: 300 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={openCart}
            className="relative rounded-full p-2.5 text-ink-soft transition hover:bg-surface-soft hover:text-ink"
            aria-label="Open cart"
          >
            <ShoppingBag size={19} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={reduced ? { duration: 0.01 } : { type: "spring", damping: 15, stiffness: 300 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full p-2 pl-2.5 text-ink-soft transition hover:bg-surface-soft hover:text-ink"
              aria-label="Account menu"
            >
              <User size={19} />
              <ChevronDown size={14} className="hidden sm:block" />
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  variants={withReducedMotion(scaleIn, reduced)}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{ transformOrigin: "top right" }}
                  className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-panel border border-line bg-surface py-1.5 shadow-elevated"
                >
                {session?.user ? (
                  <>
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate text-sm font-medium text-ink">
                        {session.user.name}
                      </p>
                      <p className="truncate text-xs text-ink-soft">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-soft"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Package size={16} /> My orders
                    </Link>
                    {session.user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-soft"
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard size={16} /> Admin dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-danger hover:bg-surface-soft"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </>
                ) : (
                  <div className="p-2">
                    <Link
                      href="/login"
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-soft"
                      onClick={() => setAccountOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface-soft"
                      onClick={() => setAccountOpen(false)}
                    >
                      Create account
                    </Link>
                  </div>
                )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0.01 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-bg lg:hidden"
          >
            <div className="px-4 pb-4 pt-2">
              <form onSubmit={handleSearch} className="mb-3 flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5">
                <Search size={16} className="text-ink-soft" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/60"
                />
              </form>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 rounded-panel px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-soft"
                  onClick={() => setMobileOpen(false)}
                >
                  <Heart size={15} /> Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-panel px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-soft"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
