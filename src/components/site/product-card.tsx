"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Plus, Stethoscope } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency, PRODUCT_TYPE_LABELS } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const open = useCart((s) => s.open);
  const onSale =
    product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        compareAtPrice: product.compare_at_price,
        quantity: 1,
        stock: product.stock,
        requiresPrescription: product.requires_prescription,
      },
      1
    );
    open();
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-shadow hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-soft">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">
              SALE
            </span>
          )}
          {product.requires_prescription === 1 && (
            <span className="flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Stethoscope size={11} /> Rx
            </span>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-[1px]">
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
              Out of stock
            </span>
          </div>
        )}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label="Add to cart"
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 disabled:opacity-0"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="label-perforation mx-4" />

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
          {PRODUCT_TYPE_LABELS[product.type] ?? product.type} · {product.brand}
        </span>
        <h3 className="line-clamp-2 font-display text-[15px] leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
          <Star size={12} className="fill-warning text-warning" />
          {product.rating.toFixed(1)}
          <span className="text-ink-soft/60">({product.reviews_count})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-mono text-base font-semibold text-ink">
            {formatCurrency(product.price)}
          </span>
          {onSale && (
            <span className="font-mono text-xs text-ink-soft line-through">
              {formatCurrency(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
