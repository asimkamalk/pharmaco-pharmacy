"use client";

import { applyOrderDiscount } from "@/lib/actions/admin";

interface OrderDiscountFormProps {
  orderId: string;
  discountPercent: number;
}

const OrderDiscountForm = ({
  orderId,
  discountPercent,
}: OrderDiscountFormProps) => {
  return (
    <form action={applyOrderDiscount} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">
            Order discount %
          </span>
          <input
            name="discountPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={discountPercent}
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-shop_light_green"
          />
        </label>
        <p className="mt-1 text-xs text-lightColor">
          Percentage off this order&apos;s subtotal (after product sale prices).
          Delivery fee stays the same.
        </p>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-shop_btn_dark_green px-4 py-2 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
      >
        Apply discount
      </button>
    </form>
  );
};

export default OrderDiscountForm;
