"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AnimatedGrid, AnimatedItem } from "@/components/site/animated-section";

export default function WishlistPage() {
  const lines = useWishlist((s) => s.lines);
  const remove = useWishlist((s) => s.remove);
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          Saved for later
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Your wishlist</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Products you&apos;ve saved from across the store.
        </p>
      </div>

      {lines.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          action={
            <LinkButton href="/shop" size="sm">
              Browse the catalog
            </LinkButton>
          }
        />
      ) : (
        <AnimatedGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {lines.map((line) => {
            const onSale =
              line.compareAtPrice && line.compareAtPrice > line.price;
            return (
              <AnimatedItem key={line.productId} className="flex">
                <div className="group flex flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
                  <Link
                    href={`/product/${line.slug}`}
                    className="relative aspect-square overflow-hidden bg-surface-soft"
                  >
                    {line.image && (
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                      {line.brand}
                    </span>
                    <Link
                      href={`/product/${line.slug}`}
                      className="line-clamp-2 font-display text-[15px] leading-snug text-ink hover:text-primary"
                    >
                      {line.name}
                    </Link>
                    <div className="mt-auto flex items-baseline gap-2 pt-2">
                      <span className="font-mono text-base font-semibold text-ink">
                        {formatCurrency(line.price)}
                      </span>
                      {onSale && (
                        <span className="font-mono text-xs text-ink-soft line-through">
                          {formatCurrency(line.compareAtPrice!)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        disabled={line.stock <= 0}
                        onClick={() => {
                          addItem(
                            {
                              productId: line.productId,
                              slug: line.slug,
                              name: line.name,
                              image: line.image,
                              price: line.price,
                              compareAtPrice: line.compareAtPrice,
                              quantity: 1,
                              stock: line.stock,
                              requiresPrescription: line.requiresPrescription,
                            },
                            1
                          );
                          openCart();
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-medium text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShoppingBag size={13} />
                        {line.stock <= 0 ? "Out of stock" : "Add to cart"}
                      </button>
                      <button
                        onClick={() => remove(line.productId)}
                        aria-label="Remove from wishlist"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition hover:text-danger"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedGrid>
      )}
    </div>
  );
}
