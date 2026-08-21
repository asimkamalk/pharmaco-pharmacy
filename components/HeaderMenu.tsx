"use client";
import { headerData } from "@/constants/data";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HeaderMenu = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden w-1/3 items-center gap-7 md:flex">
      {headerData.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className={`group relative whitespace-nowrap py-1 text-sm font-semibold capitalize text-lightColor transition-colors duration-300 hover:text-shop_light_green ${pathname === item.href && "text-shop_light_green"}`}
        >
          {item.title}

          <span
            className={`absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-shop_light_green transition-all duration-300 group-hover:w-full ${pathname === item.href && "w-full"}`}
          />
        </Link>
      ))}
    </nav>
  );
};

export default HeaderMenu;
