"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteConfig } from "@/components/SiteConfigProvider";

const Logo = () => {
  const site = useSiteConfig();

  return (
    <Link
      href="/"
      aria-label={`${site.name} homepage`}
      className="inline-flex shrink-0 items-center"
    >
      <Image
        src={site.branding.logoUrl}
        alt={site.name}
        width={1217}
        height={693}
        priority
        sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 200px"
        className="h-auto w-32 object-contain sm:w-36 lg:w-44 xl:w-48"
      />
    </Link>
  );
};

export default Logo;
