import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders · Admin" };

const AdminOrdersPage = async () => {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-darkColor">Orders</h1>
        <p className="text-sm text-lightColor">
          Track payments, fulfilment and delivery
        </p>
      </div>

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
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  No orders yet. Place a test order from the storefront.
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
                      {new Date(order.createdAt).toLocaleString("en-PK")}
                    </p>
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
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-shop_light_green hover:text-shop_dark_green"
                    >
                      Manage
                    </Link>
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
