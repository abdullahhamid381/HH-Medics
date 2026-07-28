import Link from "next/link";
import { Plus } from "lucide-react";
import { listProducts, listCategories } from "@/lib/db/products";
import { ProductsTable } from "@/components/admin/products-table";
import { LinkButton } from "@/components/ui/button";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const PAGE_SIZE = 20;

  const { items, total } = await listProducts({
    q,
    status: "all",
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
    sort: "newest",
  });
  const categories = await listCategories();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            Catalog
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">{total} products total</p>
        </div>
        <LinkButton href="/admin/products/new">
          <Plus size={16} /> Add product
        </LinkButton>
      </div>

      <ProductsTable
        products={items}
        categories={categories}
        total={total}
        page={currentPage}
        pageSize={PAGE_SIZE}
        query={q}
      />
    </div>
  );
}
