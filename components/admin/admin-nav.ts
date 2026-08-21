import {
  Boxes,
  ClipboardList,
  FileText,
  Home,
  ImageIcon,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/brands", label: "Brands", icon: Boxes },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      {
        href: "/admin/prescription-requests",
        label: "Order by Rx",
        icon: ClipboardList,
      },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Storefront",
    items: [
      { href: "/admin/hero", label: "Hero", icon: ImageIcon },
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/pages", label: "Pages", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
