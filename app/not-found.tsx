import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Page Not Found",
};

const NotFound = () => {
  return (
    <main className="bg-white">
      <Container className="flex flex-col items-center justify-center py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-shop_light_pink">
          <SearchX className="h-7 w-7 text-shop_dark_green" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-darkColor">
          Page not found
        </h1>
        <p className="mt-2 max-w-md text-sm text-lightColor">
          The page you are looking for doesn&apos;t exist or may have been
          moved. It might be a product that is no longer available.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-shop_btn_dark_green px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-black/15 px-6 text-sm font-semibold text-darkColor transition-colors duration-200 hover:border-shop_light_green hover:text-shop_light_green"
          >
            Browse Shop
          </Link>
        </div>
      </Container>
    </main>
  );
};

export default NotFound;
