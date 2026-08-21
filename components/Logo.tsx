import Image from "next/image";
import Link from "next/link";
import { getSiteConfig } from "@/lib/site";

const Logo = async () => {
  const site = await getSiteConfig();

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
        sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
        className="h-auto w-32 object-contain sm:w-36 lg:w-44 xl:w-48"
      />
    </Link>
  );
};

export default Logo;
