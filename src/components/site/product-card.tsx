"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Plus, Stethoscope, Heart, Eye } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency, PRODUCT_TYPE_LABELS, cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useQuickView } from "@/store/quick-view";
import { scaleIn, withReducedMotion } from "@/lib/motion";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const inWishlist = useWishlist((s) => s.has(product.id));
  const openQuickView = useQuickView((s) => s.open);
  const reduced = !!useReducedMotion();
  const onSale =
    !!product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock <= 0;

  const gallery: string[] = product.images ? JSON.parse(product.images) : [];
  const secondImage = gallery.find((img) => img && img !== product.image);

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
    openCart();
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      brand: product.brand,
      rating: product.rating,
      stock: product.stock,
      requiresPrescription: product.requires_prescription,
    });
  }

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault();
    openQuickView(product);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-soft">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-300",
              secondImage && "group-hover:opacity-0"
            )}
          />
        )}
        {secondImage && (
          <Image
            src={secondImage}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && (
            <motion.span
              variants={withReducedMotion(scaleIn, reduced)}
              initial="hidden"
              animate="visible"
              className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              SALE
            </motion.span>
          )}
          {product.requires_prescription === 1 && (
            <motion.span
              variants={withReducedMotion(scaleIn, reduced)}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              <Stethoscope size={11} /> Rx
            </motion.span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-card backdrop-blur transition-all duration-200",
            inWishlist
              ? "text-accent opacity-100"
              : "text-ink-soft opacity-0 group-hover:opacity-100"
          )}
        >
          <Heart size={16} className={cn(inWishlist && "fill-accent")} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-[1px]">
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
              Out of stock
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={handleQuickView}
            aria-label="Quick view"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label="Add to cart"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 disabled:opacity-0"
          >
            <Plus size={18} />
          </button>
        </div>
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
