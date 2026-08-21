"use client";

import { usePathname } from "next/navigation";

/**
 * Shows store Header/Footer on all routes except /admin.
 * Pathname is read on the client so soft navigations (admin → home)
 * correctly restore the chrome — unlike a server layout headers() check.
 */
export default function StoreChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
