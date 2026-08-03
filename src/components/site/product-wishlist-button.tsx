"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";

export function ProductWishlistButton({ product }: { product: Product }) {
  const toggle = useWishlist((s) => s.toggle);
  const wishlisted = useWishlist((s) => s.has(product.id));
  const reduced = !!useReducedMotion();

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
          rating: product.rating,
          brand: product.brand,
          stock: product.stock,
          requiresPrescription: product.requires_prescription,
        })
      }
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={cn(
        "mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition",
        wishlisted
          ? "border-danger/40 bg-danger/5 text-danger"
          : "border-line text-ink-soft hover:border-danger/40 hover:text-danger"
      )}
    >
      <motion.span
        key={wishlisted ? "on" : "off"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={reduced ? { duration: 0.01 } : { type: "spring", damping: 12, stiffness: 300 }}
        className="flex"
      >
        <Heart size={18} className={wishlisted ? "fill-danger" : ""} />
      </motion.span>
    </button>
  );
}
