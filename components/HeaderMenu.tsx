"use client";

import { headerData } from "@/constants/data";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HeaderMenu = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="hidden min-w-0 items-center justify-center gap-3 md:flex lg:gap-5 xl:gap-6"
    >
      {headerData.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.title}
            href={item.href}
            className={`group relative shrink-0 whitespace-nowrap py-1 text-sm font-semibold capitalize transition-colors duration-300 hover:text-shop_light_green ${
              active ? "text-shop_light_green" : "text-lightColor"
            }`}
          >
            {item.title}
            <span
              className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-shop_light_green transition-all duration-300 group-hover:w-full ${
                active ? "w-full" : "w-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
};

export default HeaderMenu;
