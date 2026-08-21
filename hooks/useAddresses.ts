"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddressLabel, SavedAddress } from "@/types";

interface AddressState {
  addresses: SavedAddress[];
  addAddress: (
    address: Omit<SavedAddress, "id" | "isDefault"> & { isDefault?: boolean },
  ) => string;
  updateAddress: (id: string, updates: Partial<SavedAddress>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => SavedAddress | undefined;
  getById: (id: string) => SavedAddress | undefined;
}

function createId() {
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getAddressLabelText(address: {
  label: AddressLabel;
  customLabel?: string;
}): string {
  if (address.label === "home") return "Home";
  if (address.label === "office") return "Office";
  return address.customLabel?.trim() || "Other";
}

export const useAddresses = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (address) => {
        const id = createId();
        set((state) => {
          const makeDefault =
            address.isDefault || state.addresses.length === 0;
          return {
            addresses: [
              ...state.addresses.map((item) =>
                makeDefault ? { ...item, isDefault: false } : item,
              ),
              { ...address, id, isDefault: makeDefault },
            ],
          };
        });
        return id;
      },

      updateAddress: (id, updates) =>
        set((state) => ({
          addresses: state.addresses.map((item) =>
            item.id === id ? { ...item, ...updates, id: item.id } : item,
          ),
        })),

      removeAddress: (id) =>
        set((state) => {
          const remaining = state.addresses.filter((item) => item.id !== id);
          if (
            remaining.length > 0 &&
            !remaining.some((item) => item.isDefault)
          ) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }
          return { addresses: remaining };
        }),

      setDefault: (id) =>
        set((state) => ({
          addresses: state.addresses.map((item) => ({
            ...item,
            isDefault: item.id === id,
          })),
        })),

      getDefault: () =>
        get().addresses.find((item) => item.isDefault) ?? get().addresses[0],

      getById: (id) => get().addresses.find((item) => item.id === id),
    }),
    { name: "pharmaco-addresses" },
  ),
);
