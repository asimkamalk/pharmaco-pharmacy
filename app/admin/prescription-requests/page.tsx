import Link from "next/link";
import { Search } from "lucide-react";
import AdminFlash from "@/components/admin/AdminFlash";
import { listPrescriptionRequests } from "@/lib/prescription-requests";
import { formatPkDateTime } from "@/lib/datetime";

export const metadata = { title: "Prescription requests · Admin" };

interface PageProps {
  searchParams: Promise<{ q?: string; saved?: string; error?: string }>;
}

const statusStyle: Record<string, string> = {
  pending: "bg-shop_orange/15 text-shop_orange",
  in_progress: "bg-shop_dark_green/10 text-shop_dark_green",
  fulfilled: "bg-shop_light_green/15 text-shop_dark_green",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-black/10 text-lightColor",
};

const AdminPrescriptionRequestsPage = async ({ searchParams }: PageProps) => {
  const { q, saved, error } = await searchParams;
  const query = q?.trim() ?? "";
  const requests = await listPrescriptionRequests(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-darkColor">
          Order by prescription
        </h1>
        <p className="text-sm text-lightColor">
          Customers upload a prescription and medicines note — build their
          order here
        </p>
      </div>

      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Prescription request updated."
      />

      <form
        action="/admin/prescription-requests"
        method="get"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lightColor" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by request #, customer, phone, or medicines note…"
            className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-shop_light_green"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-shop_btn_dark_green px-4 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-shop_light_bg/80 text-xs uppercase tracking-wide text-lightColor">
            <tr>
              <th className="px-4 py-3 font-semibold">Request</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Medicines note</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {requests.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  No prescription orders yet.
                </td>
              </tr>
            )}
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-shop_light_bg/40">
                <td className="px-4 py-3">
                  <p className="font-semibold text-darkColor">
                    {req.requestNumber}
                  </p>
                  <p className="text-xs text-lightColor">
                    {formatPkDateTime(req.createdAt)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p>{req.customerName}</p>
                  <p className="text-xs text-lightColor">{req.customerPhone}</p>
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p className="line-clamp-2 text-sm text-darkColor">
                    {req.medicinesNote}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusStyle[req.status] ?? statusStyle.pending}`}
                  >
                    {req.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/prescription-requests/${req.id}`}
                    className="font-medium text-shop_light_green hover:text-shop_dark_green"
                  >
                    {req.status === "fulfilled" ? "View" : "Fulfill"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPrescriptionRequestsPage;
