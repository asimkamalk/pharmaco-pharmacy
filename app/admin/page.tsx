import Link from "next/link";
import SalesChart from "@/components/admin/SalesChart";
import { getDashboardStats } from "@/lib/dashboard";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard",
};

const AdminDashboardPage = async () => {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Products", value: stats.productCount.toString() },
    { label: "Orders", value: stats.orderCount.toString() },
    { label: "Pending orders", value: stats.pendingOrders.toString() },
    { label: "Customers", value: stats.customerCount.toString() },
    { label: "30-day revenue", value: formatPrice(stats.revenue30) },
    { label: "30-day profit", value: formatPrice(stats.profit30) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-darkColor">Dashboard</h1>
          <p className="text-sm text-lightColor">
            Sales, stock and order overview
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-shop_btn_dark_green px-4 py-2 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
        >
          Add product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-lightColor">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-bold text-shop_dark_green">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-darkColor">
              Sales (last 30 days)
            </h2>
            <p className="text-xs text-lightColor">
              Green = revenue · Orange = estimated profit
            </p>
          </div>
          <div className="text-right text-xs text-lightColor">
            <p>Categories: {stats.categoryCount}</p>
            <p>Brands: {stats.brandCount}</p>
          </div>
        </div>
        <SalesChart data={stats.salesSeries} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-darkColor">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-black/5">
            {stats.recentOrders.length === 0 && (
              <li className="py-6 text-sm text-lightColor">No orders yet.</li>
            )}
            {stats.recentOrders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-semibold text-darkColor hover:text-shop_dark_green"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-lightColor">
                    {order.customerName} · {order.status}
                  </p>
                </div>
                <p className="font-semibold text-shop_dark_green">
                  {formatPrice(order.grandTotal)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-darkColor">Low stock</h2>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
            >
              Manage
            </Link>
          </div>
          <ul className="divide-y divide-black/5">
            {stats.lowStock.length === 0 && (
              <li className="py-6 text-sm text-lightColor">
                Stock levels look healthy.
              </li>
            )}
            {stats.lowStock.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-semibold text-darkColor hover:text-shop_dark_green"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-lightColor">SKU {product.sku}</p>
                </div>
                <p
                  className={`font-semibold ${
                    product.stock === 0
                      ? "text-shop_orange"
                      : "text-shop_dark_green"
                  }`}
                >
                  {product.stock} left
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
