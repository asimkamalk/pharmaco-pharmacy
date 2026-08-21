import Link from "next/link";
import SalesOverview from "@/components/admin/SalesOverview";
import { getDashboardStats } from "@/lib/dashboard";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard",
};

interface PageProps {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
  }>;
}

const AdminDashboardPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const stats = await getDashboardStats({
    preset: params.range,
    from: params.from,
    to: params.to,
  });

  const cards = [
    {
      label: "Products",
      value: stats.productCount.toString(),
      hint: "In catalog",
    },
    {
      label: "Orders",
      value: stats.orderCount.toString(),
      hint: "All time",
    },
    {
      label: "Pending orders",
      value: stats.pendingOrders.toString(),
      hint: "Needs action",
      accent: stats.pendingOrders > 0,
    },
    {
      label: "Customers",
      value: stats.customerCount.toString(),
      hint: "Registered",
    },
    {
      label: `${stats.rangeLabel} revenue`,
      value: formatPrice(stats.rangeRevenue),
      hint: "Gross sales",
    },
    {
      label: `${stats.rangeLabel} profit`,
      value: formatPrice(stats.rangeProfit),
      hint: "After cost",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-darkColor">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-lightColor">
            Sales, stock and order overview
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.pendingOrders > 0 && (
            <Link
              href="/admin/orders"
              className="rounded-xl border border-shop_orange/30 bg-shop_orange/10 px-4 py-2 text-sm font-semibold text-shop_orange transition-colors hover:bg-shop_orange/15"
            >
              {stats.pendingOrders} pending
            </Link>
          )}
          <Link
            href="/admin/products/new"
            className="rounded-xl bg-shop_btn_dark_green px-4 py-2 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
          >
            Add product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-black/8 bg-white/90 p-4 shadow-[0_1px_2px_rgba(6,60,40,0.04)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-lightColor">
              {card.label}
            </p>
            <p
              className={`mt-2 text-xl font-bold ${
                card.accent ? "text-shop_orange" : "text-shop_dark_green"
              }`}
            >
              {card.value}
            </p>
            <p className="mt-1 text-[11px] text-lightColor/80">{card.hint}</p>
          </div>
        ))}
      </div>

      <SalesOverview
        data={stats.salesSeries}
        rangeLabel={stats.rangeLabel}
        rangePreset={
          params.range === "custom" ? "custom" : stats.rangePreset
        }
        rangeFrom={params.from || stats.rangeFrom}
        rangeTo={params.to || stats.rangeTo}
        rangeRevenue={stats.rangeRevenue}
        rangeProfit={stats.rangeProfit}
        categoryCount={stats.categoryCount}
        brandCount={stats.brandCount}
      />

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
