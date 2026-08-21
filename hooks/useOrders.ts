"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDiscountedPrice } from "@/lib/utils";
import { siteConfig } from "@/constants/site";
import type {
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SavedAddress,
} from "@/types";

interface PlaceOrderInput {
  address: SavedAddress;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  prescriptionReference?: string;
  orderNotes?: string;
  items: CartItem[];
}

interface OrderState {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  getOrderById: (id: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
  updateStatus: (id: string, status: OrderStatus) => void;
}

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `PHC-${stamp}-${rand}`;
}

function paymentStatusFor(method: PaymentMethod): PaymentStatus {
  if (method === "cash_on_delivery") return "not_required";
  return "pending_verification";
}

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder: (input) => {
        const subtotal = input.items.reduce(
          (total, item) =>
            total +
            getDiscountedPrice(item.product.price, item.product.discount) *
              item.quantity,
          0,
        );
        const discountTotal = input.items.reduce(
          (total, item) =>
            total +
            (item.product.price -
              getDiscountedPrice(item.product.price, item.product.discount)) *
              item.quantity,
          0,
        );
        const deliveryFee =
          subtotal >= siteConfig.delivery.freeDeliveryAbove
            ? 0
            : siteConfig.delivery.standardFee;

        const order: Order = {
          id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          orderNumber: createOrderNumber(),
          createdAt: new Date().toISOString(),
          status: "pending",
          paymentMethod: input.paymentMethod,
          paymentStatus: paymentStatusFor(input.paymentMethod),
          paymentReference: input.paymentReference?.trim() || undefined,
          prescriptionReference:
            input.prescriptionReference?.trim() || undefined,
          customerName: input.address.fullName,
          customerPhone: input.address.phone,
          customerEmail: input.customerEmail,
          shippingAddress: {
            label: input.address.label,
            customLabel: input.address.customLabel,
            addressLine: input.address.addressLine,
            area: input.address.area,
            city: input.address.city,
          },
          orderNotes: input.orderNotes?.trim() || undefined,
          items: input.items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            image: item.product.images[0],
            sku: item.product.sku,
            quantity: item.quantity,
            unitPrice: getDiscountedPrice(
              item.product.price,
              item.product.discount,
            ),
            discount: item.product.discount,
            requiresPrescription: item.product.requiresPrescription,
          })),
          subtotal,
          discountTotal,
          deliveryFee,
          grandTotal: subtotal + deliveryFee,
        };

        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      getOrderById: (id) => get().orders.find((order) => order.id === id),

      getOrderByNumber: (orderNumber) =>
        get().orders.find((order) => order.orderNumber === orderNumber),

      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order,
          ),
        })),
    }),
    { name: "pharmaco-orders" },
  ),
);
