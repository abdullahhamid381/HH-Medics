"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star, X, Heart, ArrowUpRight } from "lucide-react";
import { useQuickView } from "@/store/quick-view";
import { useWishlist } from "@/store/wishlist";
import { AddToCartWidget } from "@/components/site/add-to-cart-widget";
import { Badge } from "@/components/ui/primitives";
import { formatCurrency, PRODUCT_TYPE_LABELS, cn } from "@/lib/utils";
import { fadeIn, withReducedMotion } from "@/lib/motion";

export function QuickViewModal() {
  const product = useQuickView((s) => s.product);
  const close = useQuickView((s) => s.close);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const inWishlist = useWishlist((s) =>
    product ? s.has(product.id) : false
  );
  const reduced = !!useReducedMotion();

  const onSale =
    !!product?.compare_at_price && product.compare_at_price > product.price;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          variants={withReducedMotion(fadeIn, reduced)}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 32 }}
            transition={reduced ? { duration: 0.01 } : { type: "spring", damping: 26, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="label-notch relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-hero border border-line bg-surface shadow-elevated sm:rounded-hero"
          >
            <button
              onClick={close}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-ink shadow-card backdrop-blur"
            >
              <X size={17} />
            </button>

            <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
              <div className="relative aspect-square overflow-hidden rounded-panel bg-surface-soft">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 40vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="primary">
                    {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
                  </Badge>
                  {onSale && <Badge tone="accent">On sale</Badge>}
                </div>
                <h2 className="mt-3 font-display text-2xl leading-tight text-ink">
                  {product.name}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">{product.brand}</p>

                <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
                  <Star size={13} className="fill-warning text-warning" />
                  {product.rating.toFixed(1)} ({product.reviews_count})
                </div>

                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className="font-mono text-2xl font-semibold text-ink">
                    {formatCurrency(product.price)}
                  </span>
                  {onSale && (
                    <span className="font-mono text-sm text-ink-soft line-through">
                      {formatCurrency(product.compare_at_price!)}
                    </span>
                  )}
                </div>

                {product.short_description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                    {product.short_description}
                  </p>
                )}

                <div className="mt-5">
                  <AddToCartWidget product={product} />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() =>
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
                      })
                    }
                    className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:text-ink"
                  >
                    <Heart
                      size={15}
                      className={cn(inWishlist && "fill-accent text-accent")}
                    />
                    {inWishlist ? "Saved" : "Save for later"}
                  </button>
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={close}
                    className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:text-ink"
                  >
                    Full details <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
