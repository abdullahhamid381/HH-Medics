"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Heart, Plus, Trash2 } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { drawerSpring } from "@/lib/motion";

export function WishlistDrawer() {
  const isOpen = useWishlist((s) => s.isOpen);
  const close = useWishlist((s) => s.close);
  const lines = useWishlist((s) => s.lines);
  const remove = useWishlist((s) => s.remove);
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);
  const reduced = !!useReducedMotion();

  function moveToCart(line: (typeof lines)[number]) {
    addItem(
      {
        productId: line.productId,
        slug: line.slug,
        name: line.name,
        image: line.image,
        price: line.price,
        compareAtPrice: line.compareAtPrice,
        quantity: 1,
        stock: 99,
        requiresPrescription: 0,
      },
      1
    );
    remove(line.productId);
    close();
    openCart();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0.01 } : undefined}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={reduced ? { duration: 0.01 } : drawerSpring}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg text-ink">
                Your wishlist ({lines.length})
              </h2>
              <button
                onClick={close}
                className="rounded-full p-2 text-ink-soft hover:bg-surface-soft"
                aria-label="Close wishlist"
              >
                <X size={20} />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft text-ink-soft">
                  <Heart size={26} />
                </div>
                <p className="font-display text-lg text-ink">
                  Nothing saved yet
                </p>
                <p className="text-sm text-ink-soft">
                  Tap the heart on any product to keep it here for later.
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {lines.map((line) => (
                  <div key={line.productId} className="flex gap-3">
                    <Link
                      href={`/product/${line.slug}`}
                      onClick={close}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-panel bg-surface-soft"
                    >
                      {line.image && (
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${line.slug}`}
                          onClick={close}
                          className="line-clamp-2 text-sm font-medium text-ink hover:text-primary"
                        >
                          {line.name}
                        </Link>
                        <button
                          onClick={() => remove(line.productId)}
                          className="shrink-0 text-ink-soft hover:text-danger"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="mt-0.5 font-mono text-sm text-primary">
                        {formatCurrency(line.price)}
                      </p>
                      <button
                        onClick={() => moveToCart(line)}
                        className="mt-auto flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary-strong transition hover:bg-primary hover:text-white"
                      >
                        <Plus size={13} /> Move to cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
