import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/Container";
import { getCategories, getProductCountByCategory } from "@/lib/products";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Categories",
  description: `Browse product categories at ${siteConfig.name} — medicines, vitamins, personal care, baby care, medical devices and more in ${siteConfig.location.area}, ${siteConfig.location.city}.`,
};

const CategoriesPage = async () => {
  const [categories, productCounts] = await Promise.all([
    getCategories(),
    getProductCountByCategory(),
  ]);

  return (
    <main className="bg-white">
      <Container className="py-8 sm:py-10">
        <header>
          <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
            Product Categories
          </h1>
          <p className="mt-1.5 text-sm text-lightColor">
            Explore our range of medicines, healthcare and wellness products.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {categories.map((category) => {
            const count = productCounts[category.slug] ?? 0;
            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-white p-4 transition-all duration-300 hover:border-shop_light_green/50 hover:shadow-md sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-shop_light_pink">
                    <Image
                      src={category.image}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-darkColor transition-colors duration-200 group-hover:text-shop_dark_green">
                      {category.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-lightColor">
                      {category.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-shop_light_green">
                      {count} product{count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-shop_light_pink transition-colors duration-300 group-hover:bg-shop_light_green group-hover:text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </main>
  );
};

export default CategoriesPage;
