import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentlyViewedLine {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  brand: string | null;
  rating: number;
}

const MAX_ITEMS = 8;

interface RecentlyViewedState {
  lines: RecentlyViewedLine[];
  record: (line: RecentlyViewedLine) => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      lines: [],
      record: (line) => {
        const withoutCurrent = get().lines.filter(
          (l) => l.productId !== line.productId
        );
        set({ lines: [line, ...withoutCurrent].slice(0, MAX_ITEMS) });
      },
    }),
    { name: "medistore-recently-viewed" }
  )
);
