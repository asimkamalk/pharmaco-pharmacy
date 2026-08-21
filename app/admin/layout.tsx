import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { getPendingOrderNotifications } from "@/lib/admin-notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  const { pendingCount, rxReviewCount, attentionCount, orders } =
    await getPendingOrderNotifications();

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
      }}
      pendingCount={pendingCount}
      rxReviewCount={rxReviewCount}
      attentionCount={attentionCount}
      notifications={orders}
    >
      {children}
    </AdminShell>
  );
}
