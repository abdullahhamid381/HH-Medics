"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = cartSubtotal(lines);

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft text-ink-soft">
          <ShoppingBag size={28} />
        </div>
        <h1 className="font-display text-2xl text-ink">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-ink-soft">
          Browse medicines, supplements, face wash, serums and cosmetics to get
          started.
        </p>
        <LinkButton href="/shop">Start shopping</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-3xl text-ink">
        Your cart ({lines.length})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {lines.map((line) => (
            <div
              key={line.productId}
              className="flex gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                {line.image && (
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/product/${line.slug}`}
                    className="font-display text-[15px] text-ink hover:text-primary"
                  >
                    {line.name}
                  </Link>
                  <button
                    onClick={() => removeItem(line.productId)}
                    className="shrink-0 text-ink-soft hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-1 font-mono text-sm text-primary">
                  {formatCurrency(line.price)}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-surface-soft"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      disabled={line.quantity >= line.stock}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-surface-soft disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-mono text-sm font-semibold text-ink">
                    {formatCurrency(line.price * line.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg text-ink">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Shipping</span>
              <span className="font-mono text-ink">
                {subtotal > 3000 ? "Free" : formatCurrency(200)}
              </span>
            </div>
          </div>
          <div className="my-4 label-perforation" />
          <div className="flex justify-between font-display text-lg text-ink">
            <span>Total</span>
            <span className="font-mono">
              {formatCurrency(subtotal + (subtotal > 3000 ? 0 : 200))}
            </span>
          </div>
          <LinkButton href="/checkout" className="mt-5 w-full">
            Proceed to checkout <ArrowRight size={16} />
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
