import Link from "next/link";
import AdminFlash from "@/components/admin/AdminFlash";
import { resolvePasswordResetRequest } from "@/lib/actions/admin";
import { formatPkDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Password Resets · Admin" };

interface PageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const AdminPasswordResetsPage = async ({ searchParams }: PageProps) => {
  const { saved, error } = await searchParams;
  const requests = await prisma.passwordResetRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true, username: true } },
    },
  });

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-darkColor">Password resets</h1>
        <p className="text-sm text-lightColor">
          Customers who forgot their password and submitted username + email
          for verification
          {pending.length > 0 ? ` · ${pending.length} pending` : ""}
        </p>
      </div>

      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Password reset request updated."
      />

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-shop_light_bg/80 text-xs uppercase tracking-wide text-lightColor">
            <tr>
              <th className="px-4 py-3 font-semibold">Username</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Matched customer</th>
              <th className="px-4 py-3 font-semibold">Requested</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="w-48 px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  No password reset requests yet.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-shop_light_bg/40">
                  <td className="px-4 py-3 font-semibold text-darkColor">
                    @{req.username}
                  </td>
                  <td className="px-4 py-3 text-lightColor">{req.email}</td>
                  <td className="px-4 py-3">
                    {req.user ? (
                      <div>
                        <Link
                          href={`/admin/customers/${req.user.id}`}
                          className="font-medium text-darkColor hover:text-shop_dark_green"
                        >
                          {req.user.name || "Unnamed"}
                        </Link>
                        <p className="text-xs text-shop_dark_green">Verified match</p>
                      </div>
                    ) : (
                      <span className="text-shop_orange">No matching account</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-lightColor">
                    {formatPkDateTime(req.createdAt)}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <span
                      className={
                        req.status === "pending"
                          ? "font-semibold text-shop_orange"
                          : "text-lightColor"
                      }
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      {req.user ? (
                        <Link
                          href={`/admin/customers/${req.user.id}`}
                          className="font-medium text-shop_light_green hover:text-shop_dark_green"
                        >
                          Reset password
                        </Link>
                      ) : (
                        <Link
                          href="/admin/customers"
                          className="font-medium text-shop_light_green hover:text-shop_dark_green"
                        >
                          Find customer
                        </Link>
                      )}
                      {req.status === "pending" && (
                        <>
                          <form action={resolvePasswordResetRequest}>
                            <input type="hidden" name="id" value={req.id} />
                            <input
                              type="hidden"
                              name="status"
                              value="resolved"
                            />
                            <button
                              type="submit"
                              className="text-sm font-medium text-shop_dark_green hover:underline"
                            >
                              Mark resolved
                            </button>
                          </form>
                          <form action={resolvePasswordResetRequest}>
                            <input type="hidden" name="id" value={req.id} />
                            <input
                              type="hidden"
                              name="status"
                              value="cancelled"
                            />
                            <button
                              type="submit"
                              className="text-sm font-medium text-shop_orange hover:underline"
                            >
                              Cancel
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPasswordResetsPage;
