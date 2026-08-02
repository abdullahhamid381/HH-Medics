"use client";

import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({ product }: { product: Product }) {
  const toggle = useWishlist((s) => s.toggle);
  const inWishlist = useWishlist((s) => s.has(product.id));

  return (
    <button
      onClick={() =>
        toggle({
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
      className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:border-accent/40 hover:text-ink"
    >
      <Heart size={16} className={cn(inWishlist && "fill-accent text-accent")} />
      {inWishlist ? "Saved to wishlist" : "Save to wishlist"}
    </button>
  );
}
