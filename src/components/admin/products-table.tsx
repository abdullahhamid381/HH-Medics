"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Search, Package } from "lucide-react";
import type { Product, Category } from "@/types";
import { Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { confirmAction } from "@/store/confirm";
import { pushToast } from "@/store/toast";
import { formatCurrency, PRODUCT_TYPE_LABELS, cn } from "@/lib/utils";

export function ProductsTable({
  products,
  total,
  page,
  pageSize,
  query,
}: {
  products: Product[];
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  query?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(query ?? "");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = await confirmAction({
      title: `Delete "${name}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      pushToast({ title: "Could not delete product", tone: "warning" });
      return;
    }
    pushToast({ title: "Product deleted", tone: "success" });
    router.refresh();
  }

  function pageHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4 flex max-w-sm items-center gap-2 rounded-full border border-line bg-surface px-4 py-2">
        <Search size={15} className="text-ink-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </form>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              query
                ? `Nothing matches "${query}". Try a different search.`
                : "Add your first product to get started."
            }
            className="border-none"
          />
        ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-soft">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                      {p.image && (
                        <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="line-clamp-1 max-w-[220px] font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-ink-soft">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {PRODUCT_TYPE_LABELS[p.type] ?? p.type}
                </td>
                <td className="px-4 py-3 font-mono text-ink">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={cn(p.stock <= 10 && "font-medium text-danger")}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.status === "active" ? "primary" : "default"}>
                    {p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-surface-soft"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deletingId === p.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-danger hover:bg-danger/10 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
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
    </div>
  );
}
