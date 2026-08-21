import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
  Boxes,
  FileText,
  Home,
  ImageIcon,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  Store,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/brands", label: "Brands", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/hero", label: "Hero", icon: ImageIcon },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-shop_light_bg">
      <div className="relative flex min-h-screen">
      <aside className="relative hidden w-64 shrink-0 border-r border-white/10 bg-shop_dark_green text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Pharmaco Admin
          </p>
          <p className="mt-1 text-sm font-semibold">{user.name || "Admin"}</p>
          <p className="truncate text-xs text-white/70">{user.email}</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
          >
            <Store className="h-4 w-4" />
            View storefront
          </Link>
        </div>
      </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-black/10 bg-white px-4 py-3 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-darkColor">
                  Admin Dashboard
                </p>
                <p className="text-xs text-lightColor">
                  Manage catalog, orders, stock and sales
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:hidden">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-black/10 bg-shop_light_bg px-3 py-1 text-xs font-medium text-darkColor"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
