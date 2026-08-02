import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistLine {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  brand: string | null;
  rating: number;
  stock: number;
  requiresPrescription: number;
}

interface WishlistState {
  lines: WishlistLine[];
  toggle: (line: WishlistLine) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      lines: [],
      toggle: (line) => {
        const exists = get().lines.some((l) => l.productId === line.productId);
        set({
          lines: exists
            ? get().lines.filter((l) => l.productId !== line.productId)
            : [line, ...get().lines],
        });
      },
      remove: (productId) =>
        set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      has: (productId) => get().lines.some((l) => l.productId === productId),
      clear: () => set({ lines: [] }),
    }),
    { name: "medistore-wishlist" }
  )
);
