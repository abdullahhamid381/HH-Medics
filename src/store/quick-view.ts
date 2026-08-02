import { create } from "zustand";
import type { Product } from "@/types";

interface QuickViewState {
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
}

export const useQuickView = create<QuickViewState>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
