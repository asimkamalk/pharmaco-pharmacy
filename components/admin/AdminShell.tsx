"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Store, X } from "lucide-react";
import AdminNotifications, {
  type AdminOrderNotice,
} from "@/components/admin/AdminNotifications";
import AdminProfileMenu, {
  type AdminProfileUser,
} from "@/components/admin/AdminProfileMenu";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import {
  adminNavGroups,
  isAdminNavActive,
} from "@/components/admin/admin-nav";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  user: AdminProfileUser;
  pendingCount: number;
  notifications: AdminOrderNotice[];
  children: React.ReactNode;
}

function NavLinks({
  pathname,
  onNavigate,
  variant = "sidebar",
}: {
  pathname: string;
  onNavigate?: () => void;
  variant?: "sidebar" | "drawer";
}) {
  const muted = variant === "sidebar" ? "text-white/45" : "text-lightColor";
  const idle =
    variant === "sidebar"
      ? "text-white/80 hover:bg-white/10 hover:text-white"
      : "text-darkColor hover:bg-shop_light_bg";
  const active =
    variant === "sidebar"
      ? "bg-white/15 text-white shadow-sm ring-1 ring-white/10"
      : "bg-shop_light_green/10 text-shop_dark_green";

  return (
    <div className="space-y-5">
      {adminNavGroups.map((group) => (
        <div key={group.label}>
          <p
            className={cn(
              "mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em]",
              muted,
            )}
          >
            {group.label}
          </p>
          <nav className="space-y-0.5">
            {group.items.map((link) => {
              const isActive = isAdminNavActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? active : idle,
                  )}
                >
                  <link.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive && variant === "sidebar" && "text-white",
                      isActive &&
                        variant === "drawer" &&
                        "text-shop_dark_green",
                    )}
                  />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}

const AdminShell = ({
  user,
  pendingCount,
  notifications,
  children,
}: AdminShellProps) => {
  const site = useSiteConfig();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3f6f4_0%,#f6f6f6_40%,#f8f5f1_100%)]">
      <div className="relative flex min-h-screen">
        <aside className="relative hidden w-[17rem] shrink-0 lg:flex lg:flex-col">
          <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-shop_dark_green text-white">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 0% 0%, rgba(59,156,60,0.45), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(251,108,8,0.18), transparent 50%)",
              }}
            />
            <div className="relative border-b border-white/10 px-5 py-5">
              <Link href="/admin" className="block">
                <span className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm">
                  <Image
                    src={site.branding.logoUrl}
                    alt={site.name}
                    width={160}
                    height={48}
                    priority
                    className="h-8 w-auto object-contain"
                  />
                </span>
              </Link>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
                Admin console
              </p>
            </div>

            <div className="admin-scrollbar relative flex-1 overflow-y-auto px-3 py-4">
              <NavLinks pathname={pathname} />
            </div>

            <div className="relative border-t border-white/10 p-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Store className="h-4 w-4" />
                View storefront
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-black/8 bg-white/85 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/8 bg-white text-darkColor transition-colors hover:bg-shop_light_bg lg:hidden"
                  aria-label="Open menu"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>

                <Link href="/admin" className="lg:hidden">
                  <Image
                    src={site.branding.logoUrl}
                    alt={site.name}
                    width={140}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                </Link>

                <div className="hidden min-w-0 lg:block">
                  <p className="text-sm font-semibold text-darkColor">
                    {site.shortName} Admin
                  </p>
                  <p className="truncate text-xs text-lightColor">
                    Catalog, orders, content & settings
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 overflow-visible sm:gap-2.5">
                <AdminNotifications
                  pendingCount={pendingCount}
                  orders={notifications}
                />
                <AdminProfileMenu user={user} />
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-shop_dark_green/40 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/8 px-4 py-4">
              <Image
                src={site.branding.logoUrl}
                alt={site.name}
                width={140}
                height={40}
                className="h-8 w-auto object-contain"
              />
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-darkColor"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="admin-scrollbar-light flex-1 overflow-y-auto px-3 py-4">
              <NavLinks
                pathname={pathname}
                variant="drawer"
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            <div className="border-t border-black/8 p-3">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-darkColor hover:bg-shop_light_bg"
              >
                <Store className="h-4 w-4" />
                View storefront
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShell;
