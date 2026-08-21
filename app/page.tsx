import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Clock,
  ShieldCheck,
  Stethoscope,
  Truck,
} from "lucide-react";
import Container from "@/components/Container";
import GoogleMap from "@/components/GoogleMap";
import HomeHero from "@/components/HomeHero";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import {
  getBestSellers,
  getBrands,
  getCategories,
  getFeaturedProducts,
} from "@/lib/products";
import { getHeroSlides } from "@/lib/hero";
import { getSiteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: { absolute: site.seo.title || site.name },
    description: site.seo.description || site.description,
    alternates: { canonical: "/" },
  };
}

const whyIcons = [BadgeCheck, Stethoscope, Truck, ShieldCheck] as const;

const Home = async () => {
  const [categories, brands, featuredProducts, bestSellers, siteConfig, heroSlides] =
    await Promise.all([
      getCategories(),
      getBrands(),
      getFeaturedProducts(8),
      getBestSellers(4),
      getSiteConfig(),
      getHeroSlides(),
    ]);

  const whyChooseUs = siteConfig.home.whyChoose.map((item, index) => ({
    ...item,
    icon: whyIcons[index % whyIcons.length],
  }));

  return (
    <main className="bg-white">
      <HomeHero slides={heroSlides} />

      {/* Popular categories */}
      <section aria-labelledby="popular-categories">
        <Container className="py-12 sm:py-14">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2
                  id="popular-categories"
                  className="text-xl font-bold text-darkColor sm:text-2xl"
                >
                  Popular Categories
                </h2>
                <p className="mt-1 text-sm text-lightColor">
                  Everything you need for everyday health.
                </p>
              </div>
              <Link
                href="/categories"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-shop_light_green transition-colors duration-200 hover:text-shop_dark_green"
              >
                View all
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {categories.slice(0, 10).map((category, index) => (
              <Reveal key={category.id} delayMs={Math.min(index, 5) * 60}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group rounded-xl border border-black/10 bg-white p-3 text-center transition-all duration-300 hover:border-shop_light_green/50 hover:shadow-md sm:p-4"
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-shop_light_pink sm:h-16 sm:w-16">
                    <Image
                      src={category.image}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </span>
                  <span className="mt-3 block text-sm font-semibold text-darkColor">
                    {category.title}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Shop by brand */}
      <section aria-labelledby="shop-brands" className="bg-shop_light_bg/50">
        <Container className="py-12 sm:py-14">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2
                  id="shop-brands"
                  className="text-xl font-bold text-darkColor sm:text-2xl"
                >
                  Shop by Brand
                </h2>
                <p className="mt-1 text-sm text-lightColor">
                  Trusted brands available at Pharmaco.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-shop_light_green transition-colors duration-200 hover:text-shop_dark_green"
              >
                View all
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
            {brands.map((brand, index) => (
              <Reveal key={brand.id} delayMs={Math.min(index, 6) * 50}>
                <Link
                  href={`/shop?brand=${brand.slug}`}
                  className="group flex flex-col items-center rounded-xl border border-black/10 bg-white p-3 text-center transition-all duration-300 hover:border-shop_light_green/50 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-black/5 bg-shop_light_bg sm:h-16 sm:w-16">
                    <Image
                      src={brand.image}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </span>
                  <span className="mt-2.5 line-clamp-2 text-xs font-semibold text-darkColor sm:text-sm">
                    {brand.title}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section aria-labelledby="featured-products" className="bg-shop_light_bg/60">
        <Container className="py-12 sm:py-14">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2
                  id="featured-products"
                  className="text-xl font-bold text-darkColor sm:text-2xl"
                >
                  Featured Products
                </h2>
                <p className="mt-1 text-sm text-lightColor">
                  Hand-picked essentials at great prices.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-shop_light_green transition-colors duration-200 hover:text-shop_dark_green"
              >
                View all
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <Reveal
                key={product.id}
                className="h-full"
                delayMs={Math.min(index, 7) * 55}
              >
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Promo banner */}
      <section aria-label="Delivery offer">
        <Container className="py-12 sm:py-14">
          <Reveal variant="scale">
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-shop_dark_green px-6 py-10 text-center sm:px-10 lg:flex-row lg:text-left">
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {siteConfig.home.promoHeadline ||
                    `Free delivery on orders above ${formatPrice(siteConfig.delivery.freeDeliveryAbove)}`}
                </h2>
                <p className="mt-2 text-sm text-white/80">
                  {siteConfig.home.promoSubcopy ||
                    `${siteConfig.delivery.estimate}. Pay with COD, bank transfer, EasyPaisa or JazzCash.`}
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-shop_dark_green transition-colors duration-200 hover:bg-shop_light_pink"
              >
                Order Now
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Order by prescription */}
      <section
        aria-labelledby="order-by-prescription"
        className="border-y border-shop_orange/15 bg-gradient-to-b from-shop_light_pink/50 to-white"
      >
        <Container className="py-12 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-shop_orange/15 text-shop_orange">
                  <ClipboardList className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2
                    id="order-by-prescription"
                    className="text-xl font-bold text-darkColor sm:text-2xl"
                  >
                    {siteConfig.home.rxOrderHeadline}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-lightColor sm:text-base">
                    {siteConfig.home.rxOrderSubcopy}
                  </p>
                </div>
              </div>
            </Reveal>

            <ol className="mt-8 space-y-4">
              {siteConfig.home.rxOrderSteps.map((step, index) => (
                <Reveal key={step} delayMs={index * 80}>
                  <li className="flex gap-3 sm:gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shop_dark_green text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-darkColor sm:text-[15px]">
                      {step}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>

            <Reveal delayMs={240}>
              <div className="mt-8">
                <Link
                  href="/order-by-prescription"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-shop_btn_dark_green px-6 text-sm font-semibold text-white transition-colors hover:bg-shop_dark_green/90"
                >
                  {siteConfig.home.rxOrderCtaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Best sellers */}
      <section aria-labelledby="best-sellers">
        <Container className="pb-12 sm:pb-14">
          <Reveal>
            <div className="mb-6">
              <h2
                id="best-sellers"
                className="text-xl font-bold text-darkColor sm:text-2xl"
              >
                Best Sellers
              </h2>
              <p className="mt-1 text-sm text-lightColor">
                Customer favourites, restocked regularly.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {bestSellers.map((product, index) => (
              <Reveal
                key={product.id}
                className="h-full"
                delayMs={Math.min(index, 3) * 70}
              >
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Why choose Pharmaco */}
      <section aria-labelledby="why-pharmaco" className="bg-shop_light_bg/60">
        <Container className="py-12 sm:py-14">
          <Reveal>
            <h2
              id="why-pharmaco"
              className="text-center text-xl font-bold text-darkColor sm:text-2xl"
            >
              Why Choose {siteConfig.shortName}?
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, index) => (
              <Reveal key={item.title} delayMs={index * 80}>
                <div className="rounded-xl border border-black/10 bg-white p-5 transition-shadow duration-300 hover:shadow-md">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-shop_light_pink">
                    <item.icon
                      className="h-5 w-5 text-shop_dark_green"
                      aria-hidden
                    />
                  </span>
                  <h3 className="mt-3.5 text-sm font-semibold text-darkColor">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-lightColor">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Service information */}
      <section aria-label="Service information">
        <Container className="py-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: Clock,
                text: siteConfig.contact.openingHours,
              },
              {
                icon: Truck,
                text: "COD · Bank · EasyPaisa · JazzCash",
              },
              {
                icon: ShieldCheck,
                text: "Prescription medicines handled responsibly",
              },
            ].map((item, index) => (
              <Reveal key={item.text} delayMs={index * 70}>
                <p className="flex items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white p-4 text-sm text-lightColor shadow-sm">
                  <item.icon
                    className="h-4 w-4 shrink-0 text-shop_light_green"
                    aria-hidden
                  />
                  {item.text}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Location map */}
      <section aria-label="Pharmacy location">
        <Container className="pb-14 pt-4 sm:pb-16">
          <Reveal variant="fade">
            <GoogleMap />
          </Reveal>
    </Container>
      </section>
    </main>
  );
};

export default Home;
