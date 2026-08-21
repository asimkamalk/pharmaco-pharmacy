import Link from "next/link";
import { notFound } from "next/navigation";
import AdminFlash from "@/components/admin/AdminFlash";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import PrescriptionReview from "@/components/admin/PrescriptionReview";
import { getOrderById } from "@/lib/orders";
import { formatPkDateTime } from "@/lib/datetime";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Order Detail · Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const AdminOrderDetailPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const order = await getOrderById(id);
  if (!order) notFound();

  const profit =
    order.grandTotal - (order.costTotal ?? 0) - order.deliveryFee;

  return (
    <div className="space-y-6">
      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Prescription review saved."
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
          >
            ← All orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-darkColor">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-lightColor">
            {formatPkDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <OrderStatusForm orderId={order.id} status={order.status} />
          <DeleteOrderButton
            orderId={order.id}
            orderNumber={order.orderNumber}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 hover:bg-red-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-lightColor">Revenue</p>
          <p className="mt-1 text-xl font-bold text-shop_dark_green">
            {formatPrice(order.grandTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-lightColor">Cost of goods</p>
          <p className="mt-1 text-xl font-bold text-darkColor">
            {formatPrice(order.costTotal ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-lightColor">Est. profit</p>
          <p className="mt-1 text-xl font-bold text-shop_orange">
            {formatPrice(profit)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-darkColor">Customer</h2>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm text-lightColor">{order.customerPhone}</p>
          <p className="text-sm text-lightColor">{order.customerEmail}</p>
          <p className="mt-3 text-sm text-lightColor">
            {order.shippingAddress.addressLine}
            <br />
            {order.shippingAddress.area}, {order.shippingAddress.city}
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-darkColor">Payment</h2>
          <p className="text-sm capitalize">
            {order.paymentMethod.replaceAll("_", " ")}
          </p>
          <p className="text-sm capitalize text-lightColor">
            {order.paymentStatus.replaceAll("_", " ")}
          </p>
          {order.paymentReference && (
            <p className="mt-2 text-sm">Ref: {order.paymentReference}</p>
          )}
        </section>
      </div>

      {(order.prescriptionStatus ?? "not_required") !== "not_required" && (
        <PrescriptionReview
          orderId={order.id}
          status={order.prescriptionStatus ?? "pending_review"}
          url={order.prescriptionUrl}
          fileName={order.prescriptionFileName}
          mimeType={order.prescriptionMimeType}
          reference={order.prescriptionReference}
          adminNote={order.prescriptionAdminNote}
        />
      )}

      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-darkColor">Line items</h2>
        <ul className="divide-y divide-black/5">
          {order.items.map((item, index) => {
            const lineProfit =
              (item.unitPrice - (item.purchasePrice ?? 0)) * item.quantity;
            return (
              <li
                key={`${item.sku}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-darkColor">{item.name}</p>
                  <p className="text-xs text-lightColor">
                    SKU {item.sku} · Qty {item.quantity} · Cost{" "}
                    {formatPrice(item.purchasePrice ?? 0)} · Sell{" "}
                    {formatPrice(item.unitPrice)}
                    {item.requiresPrescription ? " · Rx" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                  <p className="text-xs text-shop_dark_green">
                    Profit {formatPrice(lineProfit)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default AdminOrderDetailPage;
