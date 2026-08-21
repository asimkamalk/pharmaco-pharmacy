import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link
      href="/"
      aria-label="Pharmaco Pharmacy homepage"
      className="inline-flex shrink-0 items-center"
    >
      <Image
        src="/images/pharmaco-logo-text.png"
        alt="Pharmaco Pharmacy"
        width={1217}
        height={693}
        priority
        sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
        className="h-auto w-40 object-contain sm:w-48 lg:w-56 xl:w-60"
      />
    </Link>
  );
};

export default Logo;
