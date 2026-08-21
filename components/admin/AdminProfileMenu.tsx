"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type AdminProfileUser = {
  name: string | null;
  email: string | null;
  image?: string | null;
};

function initials(name: string | null, email: string | null) {
  const source = (name || email || "A").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

interface AdminProfileMenuProps {
  user: AdminProfileUser;
}

const AdminProfileMenu = ({ user }: AdminProfileMenuProps) => {
  const label = user.name || "Admin";

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white py-1.5 pl-1.5 pr-2.5 text-left transition-colors",
          "hover:border-shop_light_green/40 hover:bg-shop_light_green/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_light_green/40",
        )}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-shop_dark_green text-[11px] font-bold tracking-wide text-white">
            {initials(user.name, user.email)}
          </span>
        )}
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[9rem] truncate text-sm font-semibold text-darkColor">
            {label}
          </span>
          <span className="block max-w-[9rem] truncate text-[11px] text-lightColor">
            {user.email}
          </span>
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-lightColor sm:block" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-64 gap-0 overflow-hidden rounded-2xl border border-black/8 bg-white p-0 shadow-lg ring-0"
      >
        <PopoverHeader className="border-b border-black/6 px-4 py-3">
          <PopoverTitle className="truncate text-sm font-semibold text-darkColor">
            {label}
          </PopoverTitle>
          <p className="truncate text-xs text-lightColor">{user.email}</p>
        </PopoverHeader>
        <div className="p-1.5">
          <Link
            href="/account"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-darkColor transition-colors hover:bg-shop_light_bg"
          >
            <UserRound className="h-4 w-4 text-lightColor" />
            My account
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-darkColor transition-colors hover:bg-shop_light_bg"
          >
            <Settings className="h-4 w-4 text-lightColor" />
            Store settings
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdminProfileMenu;
