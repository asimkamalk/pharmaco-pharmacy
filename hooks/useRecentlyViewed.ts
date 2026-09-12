"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 20;

interface RecentlyViewedState {
  ids: string[];
  trackView: (productId: string) => void;
  clear: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],

      trackView: (productId) => {
        const id = productId?.trim();
        if (!id) return;
        const next = [id, ...get().ids.filter((item) => item !== id)].slice(
          0,
          MAX_RECENT,
        );
        set({ ids: next });
      },

      clear: () => set({ ids: [] }),
    }),
    { name: "pharmaco-recently-viewed" },
  ),
);
