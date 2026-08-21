import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import { auth } from "@/auth";
import { listPrescriptionRequestsForUser } from "@/lib/prescription-requests";
import { formatPkDateTime } from "@/lib/datetime";

export const metadata = { title: "Prescription requests" };

const statusStyle: Record<string, string> = {
  pending: "bg-shop_orange/15 text-shop_orange",
  in_progress: "bg-shop_dark_green/10 text-shop_dark_green",
  fulfilled: "bg-shop_light_green/15 text-shop_dark_green",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-black/10 text-lightColor",
};

const AccountPrescriptionRequestsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/account/prescription-requests");
  }

  const requests = await listPrescriptionRequestsForUser(session.user.id);

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-darkColor">
            Prescription requests
          </h1>
          <p className="mt-1 text-sm text-lightColor">
            Orders you asked us to build from a prescription
          </p>
        </div>
        <Link
          href="/order-by-prescription"
          className="inline-flex h-10 items-center rounded-lg bg-shop_btn_dark_green px-4 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
        >
          New request
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No prescription requests yet"
          description="Upload a prescription and tell us which medicines you need — we will prepare the order."
          actionLabel="Order by prescription"
          actionHref="/order-by-prescription"
        />
      ) : (
        <ul className="space-y-3">
          {requests.map((req) => (
            <li
              key={req.id}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-darkColor">
                    {req.requestNumber}
                  </p>
                  <p className="text-xs text-lightColor">
                    {formatPkDateTime(req.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusStyle[req.status] ?? statusStyle.pending}`}
                >
                  {req.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-3 text-sm text-darkColor line-clamp-3">
                {req.medicinesNote}
              </p>
              {req.status === "fulfilled" && req.orderId && (
                <Link
                  href={`/account/orders/${req.orderId}`}
                  className="mt-3 inline-block text-sm font-semibold text-shop_light_green hover:text-shop_dark_green"
                >
                  View order {req.orderNumber}
                </Link>
              )}
              {req.status === "rejected" && req.adminNote && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {req.adminNote}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default AccountPrescriptionRequestsPage;
