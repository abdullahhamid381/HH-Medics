"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = cartSubtotal(lines);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg text-ink">
                Your cart ({lines.length})
              </h2>
              <button
                onClick={close}
                className="rounded-full p-2 text-ink-soft hover:bg-surface-soft"
              >
                <X size={20} />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft text-ink-soft">
                  <ShoppingBag size={26} />
                </div>
                <p className="font-display text-lg text-ink">Your cart is empty</p>
                <p className="text-sm text-ink-soft">
                  Browse the shop to add medicines, supplements and beauty essentials.
                </p>
                <LinkButton href="/shop" onClick={close} className="mt-2">
                  Start shopping
                </LinkButton>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  {lines.map((line) => (
                    <div key={line.productId} className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-panel bg-surface-soft">
                        {line.image && (
                          <Image
                            src={line.image}
                            alt={line.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
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
                            onClick={() => removeItem(line.productId)}
                            className="shrink-0 text-ink-soft hover:text-danger"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <p className="mt-0.5 font-mono text-sm text-primary">
                          {formatCurrency(line.price)}
                        </p>
                        <div className="mt-auto flex items-center gap-2">
                          <button
                            onClick={() => setQuantity(line.productId, line.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-surface-soft"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(line.productId, line.quantity + 1)}
                            disabled={line.quantity >= line.stock}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-surface-soft disabled:opacity-40"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line px-5 py-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-ink-soft">Subtotal</span>
                    <span className="font-mono text-base font-semibold text-ink">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-ink-soft">
                    Shipping and any discounts are calculated at checkout.
                  </p>
                  <LinkButton href="/checkout" onClick={close} className="w-full">
                    Checkout
                  </LinkButton>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
