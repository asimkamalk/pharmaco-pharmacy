import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import AdminFlash from "@/components/admin/AdminFlash";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import { getAllOrders } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { formatPkDateTime } from "@/lib/datetime";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders · Admin" };

interface PageProps {
  searchParams: Promise<{ q?: string; saved?: string; error?: string }>;
}

const AdminOrdersPage = async ({ searchParams }: PageProps) => {
  const { q, saved, error } = await searchParams;
  const query = q?.trim() ?? "";
  const [orders, openRxRequests] = await Promise.all([
    getAllOrders(query),
    prisma.prescriptionRequest.count({
      where: { status: { in: ["pending", "in_progress"] } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-darkColor">Orders</h1>
          <p className="text-sm text-lightColor">
            Track payments, fulfilment and delivery
          </p>
        </div>
      </div>

      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Order deleted."
      />

      {openRxRequests > 0 && (
        <Link
          href="/admin/prescription-requests"
          className="flex items-start gap-3 rounded-2xl border border-shop_orange/30 bg-shop_light_pink/50 px-4 py-3 transition-colors hover:bg-shop_light_pink"
        >
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-shop_orange" />
          <div>
            <p className="text-sm font-semibold text-darkColor">
              {openRxRequests} Order-by-Prescription request
              {openRxRequests === 1 ? "" : "s"} waiting
            </p>
            <p className="text-xs text-lightColor">
              Customer uploaded a prescription and medicines note — open to
              build their order.
            </p>
          </div>
        </Link>
      )}

      <form
        action="/admin/orders"
        method="get"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lightColor" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by tracking number, customer, or phone…"
            className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-shop_light_green"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-shop_btn_dark_green px-4 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
          >
            Search
          </button>
          {query && (
            <Link
              href="/admin/orders"
              className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-darkColor hover:bg-shop_light_bg"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {query && (
        <p className="text-sm text-lightColor">
          {orders.length === 0
            ? `No orders match “${query}”.`
            : `${orders.length} result${orders.length === 1 ? "" : "s"} for “${query}”.`}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-shop_light_bg/80 text-xs uppercase tracking-wide text-lightColor">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Profit</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="w-28 px-4 py-3 text-left font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.length === 0 && !query && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  No orders yet. Place a test order from the storefront.
                </td>
              </tr>
            )}
            {orders.length === 0 && query && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  Try another tracking number or customer name.
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const profit =
                order.grandTotal - (order.costTotal ?? 0) - order.deliveryFee;
              return (
                <tr key={order.id} className="hover:bg-shop_light_bg/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-darkColor">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-lightColor">
                      {formatPkDateTime(order.createdAt)}
                    </p>
                    {order.prescriptionStatus === "pending_review" && (
                      <span className="mt-1 inline-block rounded-full bg-shop_orange/15 px-2 py-0.5 text-[10px] font-semibold text-shop_orange">
                        Rx review
                      </span>
                    )}
                    {order.prescriptionStatus === "approved" && (
                      <span className="mt-1 inline-block rounded-full bg-shop_light_green/15 px-2 py-0.5 text-[10px] font-semibold text-shop_dark_green">
                        Rx OK
                      </span>
                    )}
                    {order.prescriptionStatus === "rejected" && (
                      <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Rx rejected
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-lightColor">
                      {order.customerPhone}
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {order.paymentMethod.replaceAll("_", " ")}
                    <p className="text-xs text-lightColor">
                      {order.paymentStatus.replaceAll("_", " ")}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-shop_dark_green">
                    {formatPrice(order.grandTotal)}
                  </td>
                  <td className="px-4 py-3">{formatPrice(profit)}</td>
                  <td className="px-4 py-3 capitalize">
                    {order.status.replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-start gap-1.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-shop_light_green hover:text-shop_dark_green"
                      >
                        Manage
                      </Link>
                      <DeleteOrderButton
                        orderId={order.id}
                        orderNumber={order.orderNumber}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
