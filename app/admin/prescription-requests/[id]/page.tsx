import Link from "next/link";
import { notFound } from "next/navigation";
import AdminFlash from "@/components/admin/AdminFlash";
import FulfillPrescriptionForm from "@/components/admin/FulfillPrescriptionForm";
import { getPrescriptionRequestById } from "@/lib/prescription-requests";
import { formatPkDateTime } from "@/lib/datetime";

export const metadata = { title: "Prescription request · Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const AdminPrescriptionRequestDetailPage = async ({
  params,
  searchParams,
}: PageProps) => {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const request = await getPrescriptionRequestById(id);
  if (!request) notFound();

  return (
    <div className="space-y-6">
      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Saved."
      />

      <div>
        <Link
          href="/admin/prescription-requests"
          className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          ← All prescription requests
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-darkColor">
          {request.requestNumber}
        </h1>
        <p className="text-sm text-lightColor">
          Submitted {formatPkDateTime(request.createdAt)} ·{" "}
          <span className="capitalize">
            {request.status.replaceAll("_", " ")}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-3 font-semibold text-darkColor">Customer</h2>
          <p className="text-sm font-medium">{request.customerName}</p>
          <p className="text-sm text-lightColor">{request.customerPhone}</p>
          {request.customerEmail && (
            <p className="text-sm text-lightColor">{request.customerEmail}</p>
          )}
          <p className="mt-3 text-sm text-lightColor">
            {request.addressLine}
            <br />
            {request.area}, {request.city}
          </p>
        </section>

        <div className="lg:col-span-2">
          <FulfillPrescriptionForm request={request} />
        </div>
      </div>
    </div>
  );
};

export default AdminPrescriptionRequestDetailPage;
