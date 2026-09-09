"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cartLineKey,
  listPriceForPack,
  maxPackQuantity,
  resolvePackType,
  unitPriceForPack,
} from "@/lib/pack";
import { getDiscountedPrice } from "@/lib/utils";
import type { CartItem, PackType, Product } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    packType?: PackType,
  ) => void;
  removeItem: (productId: string, packType?: PackType) => void;
  setQuantity: (
    productId: string,
    quantity: number,
    packType?: PackType,
  ) => void;
  clearCart: () => void;
  getItem: (productId: string, packType?: PackType) => CartItem | undefined;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalDiscount: () => number;
}

const clampQuantity = (quantity: number, max: number) => {
  if (max <= 0) return 0;
  return Math.min(Math.max(1, quantity), max);
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, packType) => {
        const pack = resolvePackType(product, packType);
        const max = maxPackQuantity(product, pack);
        if (max <= 0) return;

        set((state) => {
          const key = cartLineKey(product.id, pack);
          const existing = state.items.find(
            (item) => cartLineKey(item.product.id, item.packType) === key,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                cartLineKey(item.product.id, item.packType) === key
                  ? {
                      ...item,
                      product,
                      quantity: clampQuantity(
                        item.quantity + quantity,
                        max,
                      ),
                    }
                  : item,
              ),
            };
          }
          const nextQty = clampQuantity(quantity, max);
          if (nextQty <= 0) return state;
          return {
            items: [
              ...state.items,
              { product, quantity: nextQty, packType: pack },
            ],
          };
        });
      },

      removeItem: (productId, packType = "unit") =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                (item.packType ?? "unit") === packType
              ),
          ),
        })),

      setQuantity: (productId, quantity, packType = "unit") =>
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.product.id !== productId) return item;
              if ((item.packType ?? "unit") !== packType) return item;
              const max = maxPackQuantity(item.product, packType);
              const next = clampQuantity(quantity, max);
              if (next <= 0) return null;
              return { ...item, quantity: next };
            })
            .filter(Boolean) as CartItem[],
        })),

      clearCart: () => set({ items: [] }),

      getItem: (productId, packType = "unit") =>
        get().items.find(
          (item) =>
            item.product.id === productId &&
            (item.packType ?? "unit") === packType,
        ),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((total, item) => {
          const pack = item.packType ?? "unit";
          return total + unitPriceForPack(item.product, pack) * item.quantity;
        }, 0),

      getTotalDiscount: () =>
        get().items.reduce((total, item) => {
          const pack = item.packType ?? "unit";
          const list = listPriceForPack(item.product, pack);
          const paid = getDiscountedPrice(list, item.product.discount);
          return total + (list - paid) * item.quantity;
        }, 0),
    }),
    {
      name: "pharmaco-cart-v2",
      version: 2,
      migrate: () => ({ items: [] }),
    },
  ),
);
