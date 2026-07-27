import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  addItem: (line: CartLine, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      addItem: (line, qty = 1) => {
        const existing = get().lines.find((l) => l.productId === line.productId);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.productId === line.productId
                ? {
                    ...l,
                    quantity: Math.min(l.quantity + qty, l.stock || 99),
                  }
                : l
            ),
          });
        } else {
          set({ lines: [...get().lines, { ...line, quantity: qty }] });
        }
      },
      removeItem: (productId) =>
        set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      setQuantity: (productId, qty) =>
        set({
          lines:
            qty <= 0
              ? get().lines.filter((l) => l.productId !== productId)
              : get().lines.map((l) =>
                  l.productId === productId
                    ? { ...l, quantity: Math.min(qty, l.stock || 99) }
                    : l
                ),
        }),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "medistore-cart" }
  )
);

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
