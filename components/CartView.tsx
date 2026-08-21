"use client";

import Image from "next/image";
import Link from "next/link";
import { ClipboardList, ShoppingBag, Trash2 } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import Container from "./Container";
import EmptyState from "./EmptyState";
import PriceView from "./PriceView";
import { useCart } from "@/hooks/useCart";
import { useIsHydrated } from "@/hooks";
import { formatPrice, getDiscountedPrice } from "@/lib/utils";
import { useSiteConfig } from "@/components/SiteConfigProvider";

const CartView = () => {
  const siteConfig = useSiteConfig();
  const isHydrated = useIsHydrated();
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);

  if (!isHydrated) {
    return (
      <Container className="py-8 sm:py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-shop_light_bg" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-shop_light_bg/60" />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-8 sm:py-10">
        <h1 className="mb-6 text-2xl font-bold text-darkColor sm:text-3xl">
          Shopping Cart
        </h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our medicines, vitamins and healthcare products and add items to your cart."
          actionLabel="Start Shopping"
          actionHref="/shop"
        />
      </Container>
    );
  }

  const subtotal = items.reduce(
    (total, item) =>
      total +
      getDiscountedPrice(item.product.price, item.product.discount) *
        item.quantity,
    0,
  );
  const totalDiscount = items.reduce(
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
  const grandTotal = subtotal + deliveryFee;
  const hasPrescriptionItems = items.some(
    (item) => item.product.requiresPrescription,
  );

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
          Shopping Cart{" "}
          <span className="text-base font-normal text-lightColor">
            ({items.length} item{items.length === 1 ? "" : "s"})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-shop_orange transition-colors duration-200 hover:text-shop_orange/80"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <li
              key={item.product.id}
              className="flex gap-4 rounded-xl border border-black/10 bg-white p-4"
            >
              <Link
                href={`/product/${item.product.slug}`}
                className="shrink-0"
                aria-label={`View ${item.product.name}`}
              >
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={96}
                  height={96}
                  className="h-20 w-20 rounded-lg border border-black/5 object-cover sm:h-24 sm:w-24"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="line-clamp-2 text-sm font-semibold text-darkColor transition-colors duration-200 hover:text-shop_dark_green"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.requiresPrescription && (
                      <span className="mt-1 inline-block rounded bg-shop_light_pink px-1.5 py-0.5 text-[11px] font-semibold text-shop_dark_green">
                        Prescription Required
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    aria-label={`Remove ${item.product.name} from cart`}
                    className="text-lightColor transition-colors duration-200 hover:text-shop_orange"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <AddToCartButton product={item.product} className="w-28" />
                  <div className="text-right">
                    <PriceView
                      price={item.product.price * item.quantity}
                      discount={item.product.discount}
                      className="justify-end text-sm"
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside aria-label="Order summary">
          <div className="sticky top-6 space-y-4 rounded-xl border border-black/10 bg-white p-5">
            <h2 className="text-base font-semibold text-darkColor">
              Order Summary
            </h2>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-lightColor">Subtotal</dt>
                <dd className="font-medium text-darkColor">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-lightColor">You saved</dt>
                  <dd className="font-medium text-shop_light_green">
                    −{formatPrice(totalDiscount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-lightColor">Delivery</dt>
                <dd className="font-medium text-darkColor">
                  {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2.5 text-base">
                <dt className="font-semibold text-darkColor">Total</dt>
                <dd className="font-bold text-shop_dark_green">
                  {formatPrice(grandTotal)}
                </dd>
              </div>
            </dl>

            <p className="text-xs text-lightColor">
              {siteConfig.delivery.estimate}. Free delivery on orders above{" "}
              {formatPrice(siteConfig.delivery.freeDeliveryAbove)}.
            </p>

            {hasPrescriptionItems && (
              <p className="flex items-start gap-2 rounded-lg bg-shop_light_pink p-3 text-xs text-darkColor">
                <ClipboardList
                  className="mt-0.5 h-4 w-4 shrink-0 text-shop_orange"
                  aria-hidden
                />
                Your cart contains prescription items. At checkout you will
                upload a photo or PDF of a valid prescription for pharmacist
                review.
              </p>
            )}

            <Link
              href="/checkout"
              className="block w-full rounded-lg bg-shop_btn_dark_green py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="block w-full rounded-lg border border-black/15 py-3 text-center text-sm font-semibold text-darkColor transition-colors duration-200 hover:border-shop_light_green hover:text-shop_light_green"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default CartView;
