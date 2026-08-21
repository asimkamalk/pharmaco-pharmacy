import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import { auth } from "@/auth";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus, PaymentMethod } from "@/types";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-shop_orange/15 text-shop_orange",
  confirmed: "bg-shop_light_green/15 text-shop_light_green",
  processing: "bg-shop_dark_green/10 text-shop_dark_green",
  out_for_delivery: "bg-shop_light_pink text-shop_dark_green",
  delivered: "bg-shop_light_green/20 text-shop_dark_green",
  cancelled: "bg-black/10 text-lightColor",
};

const paymentLabels: Record<PaymentMethod, string> = {
  cash_on_delivery: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
};

interface OrderDetailViewProps {
  orderId: string;
  justConfirmed?: boolean;
}

const OrderDetailView = async ({
  orderId,
  justConfirmed,
}: OrderDetailViewProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/account/orders/${orderId}`);
  }

  const order = await getOrderById(orderId);

  if (!order || (order.userId && order.userId !== session.user.id)) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={Package}
          title="Order not found"
          description="This order may not belong to your account, or the link is incorrect."
          actionLabel="View all orders"
          actionHref="/account/orders"
        />
      </Container>
    );
  }

  const addressLabel =
    order.shippingAddress.label === "other"
      ? order.shippingAddress.customLabel || "Other"
      : order.shippingAddress.label.charAt(0).toUpperCase() +
        order.shippingAddress.label.slice(1);

  return (
    <Container className="py-8 sm:py-10">
      {justConfirmed && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-shop_light_green/30 bg-shop_light_green/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-shop_light_green" />
          <div>
            <p className="font-semibold text-darkColor">
              Order placed successfully
            </p>
            <p className="mt-1 text-sm text-lightColor">
              Your order{" "}
              <strong className="text-darkColor">{order.orderNumber}</strong> is
              pending confirmation.{" "}
              {order.paymentMethod === "cash_on_delivery"
                ? "Please keep cash ready for delivery."
                : "We will verify your payment reference shortly."}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-darkColor">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-lightColor">
            Placed {new Date(order.createdAt).toLocaleString("en-PK")}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status]}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-darkColor">
              Items
            </h2>
            <ul className="space-y-3">
              {order.items.map((item, index) => (
                <li key={`${item.productId}-${index}`} className="flex gap-3">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-semibold text-darkColor hover:text-shop_dark_green"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-lightColor">
                      SKU {item.sku} · Qty {item.quantity}
                      {item.requiresPrescription
                        ? " · Prescription required"
                        : ""}
                    </p>
                    <p className="mt-1 text-sm font-medium text-shop_dark_green">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-darkColor">
              Delivery
            </h2>
            <p className="text-sm font-medium text-darkColor">
              {order.customerName}
            </p>
            <p className="mt-1 text-sm text-lightColor">
              {addressLabel}
              <br />
              {order.shippingAddress.addressLine}
              <br />
              {order.shippingAddress.area}, {order.shippingAddress.city}
              <br />
              {order.customerPhone}
            </p>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-darkColor">
              Payment
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-lightColor">Method</dt>
                <dd className="font-medium text-darkColor">
                  {paymentLabels[order.paymentMethod]}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-lightColor">Status</dt>
                <dd className="font-medium capitalize text-darkColor">
                  {order.paymentStatus.replaceAll("_", " ")}
                </dd>
              </div>
              {order.paymentReference && (
                <div className="flex justify-between gap-3">
                  <dt className="text-lightColor">Reference</dt>
                  <dd className="break-all font-medium text-darkColor">
                    {order.paymentReference}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-darkColor">
              Totals
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-lightColor">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between">
                  <dt className="text-lightColor">Discount</dt>
                  <dd className="text-shop_light_green">
                    −{formatPrice(order.discountTotal)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-lightColor">Delivery</dt>
                <dd>
                  {order.deliveryFee === 0
                    ? "Free"
                    : formatPrice(order.deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base">
                <dt className="font-semibold">Grand total</dt>
                <dd className="font-bold text-shop_dark_green">
                  {formatPrice(order.grandTotal)}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/account/orders"
          className="inline-flex h-10 items-center rounded-lg border border-black/15 px-5 text-sm font-semibold text-darkColor hover:border-shop_light_green"
        >
          All orders
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-10 items-center rounded-lg bg-shop_btn_dark_green px-5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
        >
          Continue shopping
        </Link>
      </div>
    </Container>
  );
};

export default OrderDetailView;
