import Link from "next/link";
import { notFound } from "next/navigation";
import AdminFlash from "@/components/admin/AdminFlash";
import CustomerForm from "@/components/admin/CustomerForm";
import DeleteCustomerButton from "@/components/admin/DeleteCustomerButton";
import RestrictCustomerButton from "@/components/admin/RestrictCustomerButton";
import { getAdminCustomerById } from "@/lib/customers";
import { formatPkDateTime } from "@/lib/datetime";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Manage Customer · Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const AdminCustomerDetailPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const customer = await getAdminCustomerById(id);
  if (!customer) notFound();

  const spend = customer.orders.reduce(
    (total, order) => total + order.grandTotal,
    0,
  );
  const displayName = customer.name || "Unnamed";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/customers"
            className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
          >
            ← All customers
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-darkColor">
            {displayName}
            {customer.isRestricted ? (
              <span className="ml-2 align-middle rounded-full bg-shop_orange/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-shop_orange">
                Restricted
              </span>
            ) : null}
          </h1>
          <p className="text-sm text-lightColor">{customer.email}</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <RestrictCustomerButton
            customerId={customer.id}
            customerName={displayName}
            isRestricted={customer.isRestricted}
            className="justify-center rounded-lg border border-shop_orange/25 bg-shop_orange/5 px-3 py-2"
          />
          <DeleteCustomerButton
            customerId={customer.id}
            customerName={displayName}
            className="justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 hover:bg-red-100"
          />
        </div>
      </div>

      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Customer updated."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-lightColor">
            Orders
          </p>
          <p className="mt-1 text-xl font-bold text-shop_dark_green">
            {customer._count.orders}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-lightColor">
            Lifetime spend
          </p>
          <p className="mt-1 text-xl font-bold text-shop_dark_green">
            {formatPrice(spend)}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-lightColor">
            Addresses
          </p>
          <p className="mt-1 text-xl font-bold text-darkColor">
            {customer._count.addresses}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-darkColor">Profile</h2>
          <CustomerForm customer={customer} />
          <p className="mt-4 text-xs text-lightColor">
            Joined {formatPkDateTime(customer.createdAt)}
            {customer.username ? ` · @${customer.username}` : ""}
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-darkColor">Saved addresses</h2>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-lightColor">No saved addresses.</p>
          ) : (
            <ul className="space-y-3">
              {customer.addresses.map((address) => (
                <li
                  key={address.id}
                  className="rounded-xl border border-black/8 bg-shop_light_bg/50 px-3.5 py-3 text-sm"
                >
                  <p className="font-semibold text-darkColor">
                    {address.fullName}
                    {address.isDefault ? (
                      <span className="ml-2 text-[11px] font-medium uppercase tracking-wide text-shop_light_green">
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="text-lightColor">{address.phone}</p>
                  <p className="mt-1 text-lightColor">
                    {address.addressLine}
                    <br />
                    {address.area}, {address.city}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-darkColor">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
          >
            All orders
          </Link>
        </div>
        {customer.orders.length === 0 ? (
          <p className="py-4 text-sm text-lightColor">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {customer.orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-semibold text-darkColor hover:text-shop_dark_green"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs capitalize text-lightColor">
                    {order.status.replaceAll("_", " ")} ·{" "}
                    {formatPkDateTime(order.createdAt)}
                  </p>
                </div>
                <p className="font-semibold text-shop_dark_green">
                  {formatPrice(order.grandTotal)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminCustomerDetailPage;
