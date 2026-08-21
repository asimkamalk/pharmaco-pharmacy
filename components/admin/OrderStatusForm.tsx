"use client";

import { setOrderStatus } from "@/lib/actions/admin";
import type { OrderStatus } from "@/types";

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

interface OrderStatusFormProps {
  orderId: string;
  status: OrderStatus;
}

const OrderStatusForm = ({ orderId, status }: OrderStatusFormProps) => {
  return (
    <form
      action={async (formData) => {
        const next = String(formData.get("status")) as OrderStatus;
        await setOrderStatus(orderId, next);
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">Order status</span>
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-shop_light_green"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded-lg bg-shop_btn_dark_green px-4 py-2 text-sm font-semibold text-white"
      >
        Update
      </button>
    </form>
  );
};

export default OrderStatusForm;
