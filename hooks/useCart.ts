"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDiscountedPrice } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItem: (productId: string) => CartItem | undefined;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalDiscount: () => number;
}

const clampQuantity = (quantity: number, stock: number) =>
  Math.min(Math.max(1, quantity), Math.max(1, stock));

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        if (product.stock <= 0) return;
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: clampQuantity(
                        item.quantity + quantity,
                        product.stock,
                      ),
                    }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { product, quantity: clampQuantity(quantity, product.stock) },
            ],
          };
        });
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: clampQuantity(quantity, item.product.stock),
                }
              : item,
          ),
        })),

      clearCart: () => set({ items: [] }),

      getItem: (productId) =>
        get().items.find((item) => item.product.id === productId),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) =>
            total +
            getDiscountedPrice(item.product.price, item.product.discount) *
              item.quantity,
          0,
        ),

      getTotalDiscount: () =>
        get().items.reduce(
          (total, item) =>
            total +
            (item.product.price -
              getDiscountedPrice(item.product.price, item.product.discount)) *
              item.quantity,
          0,
        ),
    }),
    { name: "pharmaco-cart" },
  ),
);
