import Link from "next/link";
import { Search } from "lucide-react";
import AdminFlash from "@/components/admin/AdminFlash";
import DeleteCustomerButton from "@/components/admin/DeleteCustomerButton";
import RestrictCustomerButton from "@/components/admin/RestrictCustomerButton";
import { formatPkDate } from "@/lib/datetime";
import { getAdminCustomers } from "@/lib/customers";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Customers · Admin" };

interface PageProps {
  searchParams: Promise<{ q?: string; saved?: string; error?: string }>;
}

const AdminCustomersPage = async ({ searchParams }: PageProps) => {
  const { q, saved, error } = await searchParams;
  const query = q?.trim() ?? "";
  const customers = await getAdminCustomers(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-darkColor">Customers</h1>
        <p className="text-sm text-lightColor">
          Registered customers and their order activity
        </p>
      </div>

      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Customer deleted."
      />

      <form
        action="/admin/customers"
        method="get"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Search customers</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lightColor" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by name, email, or username…"
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
              href="/admin/customers"
              className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-darkColor hover:bg-shop_light_bg"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {query && (
        <p className="text-sm text-lightColor">
          {customers.length === 0
            ? `No customers match “${query}”.`
            : `${customers.length} result${customers.length === 1 ? "" : "s"} for “${query}”.`}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-shop_light_bg/80 text-xs uppercase tracking-wide text-lightColor">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Lifetime spend</th>
              <th className="w-36 px-4 py-3 text-left font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {customers.length === 0 && !query && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.length === 0 && query && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  Try another name or email.
                </td>
              </tr>
            )}
            {customers.map((customer) => {
              const spend = customer.orders.reduce(
                (total, order) => total + order.grandTotal,
                0,
              );
              const displayName = customer.name || "Unnamed";
              return (
                <tr key={customer.id} className="hover:bg-shop_light_bg/40">
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-darkColor">
                        {displayName}
                      </p>
                      {customer.isRestricted && (
                        <span className="rounded-full bg-shop_orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-shop_orange">
                          Restricted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-lightColor">{customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-lightColor">
                    {formatPkDate(customer.createdAt)}
                  </td>
                  <td className="px-4 py-3">{customer._count.orders}</td>
                  <td className="px-4 py-3 font-semibold text-shop_dark_green">
                    {formatPrice(spend)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-start gap-1.5">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-shop_light_green hover:text-shop_dark_green"
                      >
                        Manage
                      </Link>
                      <RestrictCustomerButton
                        customerId={customer.id}
                        customerName={displayName}
                        isRestricted={customer.isRestricted}
                      />
                      <DeleteCustomerButton
                        customerId={customer.id}
                        customerName={displayName}
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

export default AdminCustomersPage;
