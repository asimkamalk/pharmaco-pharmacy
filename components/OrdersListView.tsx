import Link from "next/link";
import { ClipboardList, Package } from "lucide-react";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import { auth } from "@/auth";
import { getOrdersForUser } from "@/lib/orders";
import { listPrescriptionRequestsForUser } from "@/lib/prescription-requests";
import { formatPkDateTime } from "@/lib/datetime";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus, PaymentMethod } from "@/types";
import { redirect } from "next/navigation";

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

const OrdersListView = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account/orders");

  const [orders, rxRequests] = await Promise.all([
    getOrdersForUser(session.user.id),
    listPrescriptionRequestsForUser(session.user.id),
  ]);

  const openRxCount = rxRequests.filter(
    (req) => req.status === "pending" || req.status === "in_progress",
  ).length;

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
          My Orders
        </h1>
        <Link
          href="/account"
          className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          ← Back to account
        </Link>
      </div>

      {rxRequests.length > 0 && (
        <Link
          href="/account/prescription-requests"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-shop_orange/30 bg-shop_light_pink/50 px-4 py-3.5 transition-colors hover:bg-shop_light_pink"
        >
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-shop_orange" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-darkColor">
              Order by prescription
              {openRxCount > 0
                ? ` · ${openRxCount} waiting`
                : ` · ${rxRequests.length} request${rxRequests.length === 1 ? "" : "s"}`}
            </p>
            <p className="mt-0.5 text-xs text-lightColor">
              View uploaded prescriptions and request status — these are not
              listed as shop orders until our pharmacist prepares them.
            </p>
          </div>
          <span className="shrink-0 self-center text-sm font-semibold text-shop_orange">
            View →
          </span>
        </Link>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order, it will appear here with status and payment details."
          actionLabel="Start Shopping"
          actionHref="/shop"
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="block rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all duration-200 hover:border-shop_light_green/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-darkColor">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-lightColor">
                      {formatPkDateTime(order.createdAt)} ·{" "}
                      {paymentLabels[order.paymentMethod]} ·{" "}
                      {order.shippingAddress.city}
                    </p>
                    {order.prescriptionStatus &&
                      order.prescriptionStatus !== "not_required" && (
                        <p className="mt-1.5 text-xs font-medium text-shop_orange">
                          Prescription{" "}
                          {order.prescriptionStatus === "approved"
                            ? "approved"
                            : order.prescriptionStatus === "rejected"
                              ? "rejected"
                              : "under review"}{" "}
                          · open order to view file
                        </p>
                      )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[order.status]}`}
                  >
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p className="text-lightColor">
                    {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                  <p className="font-semibold text-shop_dark_green">
                    {formatPrice(order.grandTotal)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default OrdersListView;
