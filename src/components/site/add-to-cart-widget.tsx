"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Stethoscope } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";

export function AddToCartWidget({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const open = useCart((s) => s.open);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        compareAtPrice: product.compare_at_price,
        quantity: qty,
        stock: product.stock,
        requiresPrescription: product.requires_prescription,
      },
      qty
    );
    open();
  }

  return (
    <div className="space-y-4">
      {product.requires_prescription === 1 && (
        <div className="flex items-start gap-2.5 rounded-panel bg-warning/10 px-4 py-3 text-sm text-warning">
          <Stethoscope size={17} className="mt-0.5 shrink-0" />
          <span>
            This is a prescription medicine. Our pharmacist will verify your
            prescription before dispatch.
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-line">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
          >
            <Minus size={15} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
            className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-40"
          >
            <Plus size={15} />
          </button>
        </div>

        <Button
          onClick={handleAdd}
          disabled={outOfStock}
          size="lg"
          className="flex-1"
        >
          <ShoppingBag size={17} />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </div>

      <p className="text-xs text-ink-soft">
        {outOfStock
          ? "This item is currently unavailable."
          : `${product.stock} in stock — ships within 24 hours.`}
      </p>
    </div>
  );
}
