"use client";

import { useEffect } from "react";
import type { Product } from "@/types";
import { useRecentlyViewed } from "@/store/recently-viewed";

export function RecordProductView({ product }: { product: Product }) {
  const record = useRecentlyViewed((s) => s.record);
  useEffect(() => {
    record({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      brand: product.brand,
      rating: product.rating,
    });
    // Only re-run if the viewed product itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}
