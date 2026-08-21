"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, MapPinned, Package, Settings, UserRound } from "lucide-react";
import type { Session } from "next-auth";

interface SigninProps {
  /** Server-resolved user so the header is correct on first paint. */
  initialUser?: Session["user"] | null;
}

const Signin = ({ initialUser = null }: SigninProps) => {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user ?? initialUser;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading" && !user) {
    return (
      <span
        aria-hidden
        className="h-7 w-7 animate-pulse rounded-full bg-shop_light_bg"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-full border border-shop_dark_green/15 bg-shop_light_pink/60 px-3.5 py-1.5 text-sm font-semibold text-shop_dark_green transition-colors duration-200 hover:bg-shop_light_pink"
      >
        Login
      </Link>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-shop_dark_green/20 bg-shop_light_pink text-xs font-bold text-shop_dark_green"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-black/5 px-3.5 py-2.5">
            <p className="truncate text-sm font-semibold text-darkColor">
              {user.name || "Account"}
            </p>
            {user.email && (
              <p className="truncate text-xs text-lightColor">{user.email}</p>
            )}
          </div>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-darkColor transition-colors hover:bg-shop_light_bg"
          >
            <UserRound className="h-4 w-4 text-shop_light_green" />
            My Account
          </Link>
          <Link
            href="/account/addresses"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-darkColor transition-colors hover:bg-shop_light_bg"
          >
            <MapPinned className="h-4 w-4 text-shop_light_green" />
            Addresses
          </Link>
          <Link
            href="/account/orders"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-darkColor transition-colors hover:bg-shop_light_bg"
          >
            <Package className="h-4 w-4 text-shop_light_green" />
            My Orders
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-shop_dark_green transition-colors hover:bg-shop_light_bg"
            >
              <Settings className="h-4 w-4" />
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 border-t border-black/5 px-3.5 py-2.5 text-left text-sm text-shop_orange transition-colors hover:bg-shop_light_pink/50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default Signin;
