import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Customers · Admin" };

const AdminCustomersPage = async () => {
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: { grandTotal: true, id: true },
      },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-darkColor">Customers</h1>
        <p className="text-sm text-lightColor">
          Registered customers and their order activity
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-shop_light_bg/80 text-xs uppercase tracking-wide text-lightColor">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Lifetime spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.map((customer) => {
              const spend = customer.orders.reduce(
                (total, order) => total + order.grandTotal,
                0,
              );
              return (
                <tr key={customer.id} className="hover:bg-shop_light_bg/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-darkColor">
                      {customer.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-lightColor">{customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-lightColor">
                    {customer.createdAt.toLocaleDateString("en-PK")}
                  </td>
                  <td className="px-4 py-3">{customer._count.orders}</td>
                  <td className="px-4 py-3 font-semibold text-shop_dark_green">
                    {formatPrice(spend)}
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

export default AdminCustomersPage;
