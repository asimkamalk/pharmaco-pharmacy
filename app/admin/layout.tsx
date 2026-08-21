import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { getPendingOrderNotifications } from "@/lib/admin-notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  const { pendingCount, orders } = await getPendingOrderNotifications();

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
      }}
      pendingCount={pendingCount}
      notifications={orders}
    >
      {children}
    </AdminShell>
  );
}
