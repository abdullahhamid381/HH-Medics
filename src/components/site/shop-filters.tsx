"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const TYPE_OPTIONS = [
  { value: "medicine", label: "Medicine" },
  { value: "supplement", label: "Supplement" },
  { value: "facewash", label: "Face Wash" },
  { value: "serum", label: "Serum" },
  { value: "cosmetic", label: "Cosmetic" },
];

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  const activeCategory = searchParams.get("category") ?? "";
  const activeType = searchParams.get("type") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q || null);
  }

  const hasActiveFilters = activeCategory || activeType || searchParams.get("q");

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-primary"
          />
        </form>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-soft"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <div className={cn("mt-4 space-y-4 lg:mt-0 lg:block", !mobileOpen && "hidden")}>
        <div className="hidden lg:block">
          <form onSubmit={handleSearchSubmit}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search medicines, serums, vitamins..."
              className="h-11 w-full max-w-md rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-primary"
            />
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateParam("category", null)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              !activeCategory
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-ink-soft hover:bg-surface-soft"
            )}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.slug)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                activeCategory === cat.slug
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-surface text-ink-soft hover:bg-surface-soft"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-soft">Type:</span>
            <button
              onClick={() => updateParam("type", null)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                !activeType
                  ? "bg-primary-soft text-primary-strong"
                  : "text-ink-soft hover:bg-surface-soft"
              )}
            >
              All
            </button>
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => updateParam("type", t.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  activeType === t.value
                    ? "bg-primary-soft text-primary-strong"
                    : "text-ink-soft hover:bg-surface-soft"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={() => router.push(pathname)}
                className="flex items-center gap-1 text-xs text-ink-soft hover:text-danger"
              >
                <X size={13} /> Clear
              </button>
            )}
            <select
              value={activeSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="h-9 rounded-full border border-line bg-surface px-3 text-xs outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
