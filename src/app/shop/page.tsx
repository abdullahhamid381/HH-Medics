import Link from "next/link";
import { listCategories, listProducts } from "@/lib/db/products";
import { ProductCard } from "@/components/site/product-card";
import { ShopFilters } from "@/components/site/shop-filters";
import { cn } from "@/lib/utils";
import { PackageSearch } from "lucide-react";
import { AnimatedGrid, AnimatedItem } from "@/components/site/animated-section";

const PAGE_SIZE = 12;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const categories = await listCategories();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const { items, total } = await listProducts({
    q: params.q,
    category: params.category,
    type: params.type,
    sort: (params.sort as never) ?? "newest",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategoryName = categories.find((c) => c.slug === params.category)?.name;

  function pageHref(p: number) {
    const sp = new URLSearchParams(params as Record<string, string>);
    sp.set("page", String(p));
    return `/shop?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          {activeCategoryName ?? "Full catalog"}
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">
          {params.q ? `Results for "${params.q}"` : "Shop all products"}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {total} product{total === 1 ? "" : "s"} found
        </p>
      </div>

      <ShopFilters categories={categories} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line py-20 text-center">
          <PackageSearch size={32} className="text-ink-soft" />
          <p className="font-display text-lg text-ink">No products found</p>
          <p className="max-w-xs text-sm text-ink-soft">
            Try a different search term or clear your filters to see the full
            catalog.
          </p>
          <Link href="/shop" className="text-sm font-medium text-primary hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <AnimatedGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <AnimatedItem key={p.id} className="flex">
                <ProductCard product={p} />
              </AnimatedItem>
            ))}
          </AnimatedGrid>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition",
                    p === page
                      ? "bg-primary text-white"
                      : "border border-line text-ink-soft hover:bg-surface-soft"
                  )}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
