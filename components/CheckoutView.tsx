"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Building2,
  ClipboardList,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";
import AddressManager from "./AddressManager";
import Container from "./Container";
import EmptyState from "./EmptyState";
import { useCart } from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddresses";
import { useIsHydrated } from "@/hooks";
import { placeOrder } from "@/lib/orders";
import { checkoutFormSchema } from "@/lib/validations";
import { formatPrice, getDiscountedPrice, cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";
import type { PaymentMethod } from "@/types";

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors duration-200 placeholder:text-lightColor/60 focus:border-shop_light_green";

const paymentOptions: {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: typeof Banknote;
}[] = [
  {
    id: "cash_on_delivery",
    title: "Cash on Delivery",
    description: "Pay in cash when your order arrives",
    icon: Banknote,
  },
  {
    id: "bank_transfer",
    title: "Bank Transfer",
    description: "Transfer to our bank account, then share the reference",
    icon: Building2,
  },
  {
    id: "easypaisa",
    title: "EasyPaisa",
    description: "Send payment to our EasyPaisa number",
    icon: Smartphone,
  },
  {
    id: "jazzcash",
    title: "JazzCash",
    description: "Send payment to our JazzCash number",
    icon: Wallet,
  },
];

const CheckoutView = () => {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const addresses = useAddresses((state) => state.addresses);
  const getDefault = useAddresses((state) => state.getDefault);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash_on_delivery");
  const [paymentReference, setPaymentReference] = useState("");
  const [prescriptionReference, setPrescriptionReference] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultAddressId = getDefault()?.id ?? addresses[0]?.id ?? "";
  const activeAddressId = selectedAddressId ?? defaultAddressId;

  const requiresPrescription = useMemo(
    () => items.some((item) => item.product.requiresPrescription),
    [items],
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      getDiscountedPrice(item.product.price, item.product.discount) *
        item.quantity,
    0,
  );
  const discountTotal = items.reduce(
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

  const selectedAddress = addresses.find(
    (address) => address.id === activeAddressId,
  );

  const handlePlaceOrder = async () => {
    const parsed = checkoutFormSchema.safeParse({
      addressId: activeAddressId,
      paymentMethod,
      paymentReference,
      prescriptionReference,
      orderNotes,
      requiresPrescription,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    if (!selectedAddress) {
      setErrors({ addressId: "Please select a delivery address" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const order = await placeOrder({
        address: {
          label: selectedAddress.label,
          customLabel: selectedAddress.customLabel,
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          email: selectedAddress.email,
          addressLine: selectedAddress.addressLine,
          area: selectedAddress.area,
          city: selectedAddress.city,
        },
        paymentMethod,
        paymentReference: parsed.data.paymentReference,
        prescriptionReference: parsed.data.prescriptionReference,
        orderNotes: parsed.data.orderNotes,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      router.push(`/account/orders/${order.id}?confirmed=1`);
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Could not place order. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <Container className="py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-shop_light_bg" />
        <div className="mt-6 h-96 animate-pulse rounded-2xl bg-shop_light_bg/70" />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={CreditCard}
          title="Nothing to checkout"
          description="Your cart is empty. Add products before placing an order."
          actionLabel="Browse Shop"
          actionHref="/shop"
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1.5 text-sm text-lightColor">
          Confirm delivery, choose payment, and place your order.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <AddressManager
              selectable
              selectedId={activeAddressId}
              onSelect={setSelectedAddressId}
            />
            {errors.addressId && (
              <p className="mt-3 text-xs text-shop_orange">{errors.addressId}</p>
            )}
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-darkColor">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => {
                const selected = paymentMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                      selected
                        ? "border-shop_light_green bg-shop_light_pink/50 shadow-sm"
                        : "border-black/10 hover:border-shop_light_green/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        selected
                          ? "bg-shop_light_green text-white"
                          : "bg-shop_light_bg text-shop_dark_green",
                      )}
                    >
                      <option.icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-darkColor">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-lightColor">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === "cash_on_delivery" && (
              <div className="mt-4 rounded-xl bg-shop_light_bg/80 p-4 text-sm text-lightColor">
                Please keep the exact amount ready. Our rider will collect{" "}
                <strong className="text-darkColor">
                  {formatPrice(grandTotal)}
                </strong>{" "}
                on delivery.
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="mt-4 space-y-3 rounded-xl border border-shop_dark_green/15 bg-shop_light_pink/40 p-4 text-sm">
                <p className="font-semibold text-darkColor">
                  Transfer to this account, then enter the reference below.
                </p>
                <dl className="grid grid-cols-1 gap-2 text-lightColor sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Bank</dt>
                    <dd className="font-medium text-darkColor">
                      {siteConfig.payments.bankTransfer.bankName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">
                      Account title
                    </dt>
                    <dd className="font-medium text-darkColor">
                      {siteConfig.payments.bankTransfer.accountTitle}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">
                      Account number
                    </dt>
                    <dd className="font-medium text-darkColor">
                      {siteConfig.payments.bankTransfer.accountNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">IBAN</dt>
                    <dd className="font-medium text-darkColor">
                      {siteConfig.payments.bankTransfer.iban}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-lightColor">
                  Amount:{" "}
                  <strong className="text-shop_dark_green">
                    {formatPrice(grandTotal)}
                  </strong>
                  . Order stays pending until Pharmaco verifies your transfer.
                </p>
              </div>
            )}

            {paymentMethod === "easypaisa" && (
              <div className="mt-4 space-y-2 rounded-xl border border-shop_orange/20 bg-shop_light_pink/50 p-4 text-sm">
                <p className="font-semibold text-darkColor">
                  Send {formatPrice(grandTotal)} via EasyPaisa
                </p>
                <p className="text-lightColor">
                  Account title:{" "}
                  <strong className="text-darkColor">
                    {siteConfig.payments.easyPaisa.accountTitle}
                  </strong>
                </p>
                <p className="text-lightColor">
                  Mobile:{" "}
                  <strong className="text-darkColor">
                    {siteConfig.payments.easyPaisa.mobileNumber}
                  </strong>
                </p>
                <p className="text-xs text-lightColor">
                  After paying, paste the transaction ID below. We verify
                  manually — no fake gateway confirmation.
                </p>
              </div>
            )}

            {paymentMethod === "jazzcash" && (
              <div className="mt-4 space-y-2 rounded-xl border border-shop_dark_green/15 bg-shop_light_bg p-4 text-sm">
                <p className="font-semibold text-darkColor">
                  Send {formatPrice(grandTotal)} via JazzCash
                </p>
                <p className="text-lightColor">
                  Account title:{" "}
                  <strong className="text-darkColor">
                    {siteConfig.payments.jazzCash.accountTitle}
                  </strong>
                </p>
                <p className="text-lightColor">
                  Mobile:{" "}
                  <strong className="text-darkColor">
                    {siteConfig.payments.jazzCash.mobileNumber}
                  </strong>
                </p>
                <p className="text-xs text-lightColor">
                  After paying, paste the transaction ID below. Payment is
                  verified manually by the pharmacy.
                </p>
              </div>
            )}

            {paymentMethod !== "cash_on_delivery" && (
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-darkColor">
                  Transaction / reference ID
                </label>
                <input
                  className={inputClasses}
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  placeholder="e.g. TID123456789 or bank slip number"
                />
                {errors.paymentReference && (
                  <p className="mt-1 text-xs text-shop_orange">
                    {errors.paymentReference}
                  </p>
                )}
              </div>
            )}
          </section>

          {requiresPrescription && (
            <section className="rounded-2xl border border-shop_orange/30 bg-shop_light_pink/40 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-shop_orange" />
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-darkColor">
                    Prescription Required
                  </h2>
                  <p className="mt-1 text-sm text-lightColor">
                    Your cart includes prescription medicines. Share a reference
                    so we can verify before dispatch (WhatsApp the photo to{" "}
                    {siteConfig.contact.whatsapp}, or note how you will provide
                    it).
                  </p>
                  <input
                    className={cn(inputClasses, "mt-3")}
                    value={prescriptionReference}
                    onChange={(event) =>
                      setPrescriptionReference(event.target.value)
                    }
                    placeholder="e.g. Sent on WhatsApp / file name / doctor note"
                  />
                  {errors.prescriptionReference && (
                    <p className="mt-1 text-xs text-shop_orange">
                      {errors.prescriptionReference}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <label className="mb-1.5 block text-sm font-medium text-darkColor">
              Order notes (optional)
            </label>
            <textarea
              className={inputClasses}
              rows={3}
              value={orderNotes}
              onChange={(event) => setOrderNotes(event.target.value)}
              placeholder="Any special delivery instructions..."
            />
          </section>
        </div>

        <aside className="lg:col-span-2">
          <div className="sticky top-6 space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-darkColor">
              Order Summary
            </h2>
            <ul className="max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <li key={item.product.id} className="flex gap-3">
                  <Image
                    src={item.product.images[0]}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-lg border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-darkColor">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-lightColor">
                      Qty {item.quantity} ·{" "}
                      {formatPrice(
                        getDiscountedPrice(
                          item.product.price,
                          item.product.discount,
                        ) * item.quantity,
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 border-t border-black/10 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-lightColor">Subtotal</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between">
                  <dt className="text-lightColor">Discount</dt>
                  <dd className="font-medium text-shop_light_green">
                    −{formatPrice(discountTotal)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-lightColor">Delivery</dt>
                <dd className="font-medium">
                  {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base">
                <dt className="font-semibold text-darkColor">Total</dt>
                <dd className="font-bold text-shop_dark_green">
                  {formatPrice(grandTotal)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="w-full rounded-xl bg-shop_btn_dark_green py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90 disabled:opacity-60"
            >
              {isSubmitting ? "Placing order..." : "Place Order"}
            </button>
            {errors.form && (
              <p className="text-center text-xs text-shop_orange">
                {errors.form}
              </p>
            )}
            <Link
              href="/cart"
              className="block text-center text-sm font-medium text-lightColor hover:text-shop_light_green"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default CheckoutView;
