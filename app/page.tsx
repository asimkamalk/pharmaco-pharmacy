import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
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
import HeroLcpPreload from "@/components/HeroLcpPreload";
import HomeHero from "@/components/HomeHero";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import {
  getBestSellers,
  getBrands,
  getCategories,
  getFeaturedProducts,
  getRecentlyAddedProducts,
} from "@/lib/products";
import { getHeroSlides } from "@/lib/hero";
import { getSiteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

const RecentlyViewedSection = dynamic(
  () => import("@/components/RecentlyViewedSection"),
);
const ProductCarousel = dynamic(() => import("@/components/ProductCarousel"));
const BrandLogoStrip = dynamic(() => import("@/components/BrandLogoStrip"));
const GoogleMap = dynamic(() => import("@/components/GoogleMap"));

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: { absolute: site.seo.title || site.name },
    description: site.seo.description || site.description,
    alternates: { canonical: "/" },
  };
}

const whyIcons = [BadgeCheck, Stethoscope, Truck, ShieldCheck] as const;

function SectionHeader({
  id,
  title,
  subtitle,
  href,
}: {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div className="max-w-xl">
        <p className="store-kicker">Pharmaco</p>
        <h2 id={id} className="store-heading mt-2 text-2xl sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-lightColor sm:text-[15px]">
          {subtitle}
        </p>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-shop_btn_dark_green transition-colors duration-200 hover:text-shop_leaf"
        >
          View all
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

const Home = async () => {
  const [categories, brands, featuredProducts, bestSellers, recentlyAdded, siteConfig, heroSlides] =
    await Promise.all([
      getCategories(),
      getBrands(),
      getFeaturedProducts(8),
      getBestSellers(20),
      getRecentlyAddedProducts(20),
      getSiteConfig(),
      getHeroSlides(),
    ]);

  const whyChooseUs = siteConfig.home.whyChoose.map((item, index) => ({
    ...item,
    icon: whyIcons[index % whyIcons.length],
  }));

  const lcpImage = heroSlides[0]?.backgroundUrl;

  return (
    <main className="store-surface">
      {lcpImage ? <HeroLcpPreload src={lcpImage} /> : null}
      <HomeHero slides={heroSlides} />

      {/* Popular categories */}
      <section aria-labelledby="popular-categories" className="store-mesh">
        <Container className="py-14 sm:py-16">
          <Reveal>
            <SectionHeader
              id="popular-categories"
              title="Shop by need"
              subtitle="Everyday medicines and wellness essentials, ready for pickup or delivery."
              href="/categories"
            />
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((category, index) => (
              <Reveal key={category.id} delayMs={Math.min(index, 6) * 45}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group flex flex-col items-center rounded-2xl bg-white/70 px-3 py-4 text-center ring-1 ring-shop_dark_green/8 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:ring-shop_light_green/35"
                >
                  <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-shop_mist to-white ring-1 ring-shop_dark_green/10 sm:h-16 sm:w-16">
                    {category.image.includes("placeholder") ? (
                      <span className="font-heading text-xl font-semibold text-shop_dark_green sm:text-2xl">
                        {category.title.trim().charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <Image
                        src={category.image}
                        alt=""
                        width={64}
                        height={64}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </span>
                  <span className="mt-3 line-clamp-2 text-xs font-medium leading-snug text-darkColor sm:text-sm">
                    {category.title}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Personalized recently viewed */}
      <RecentlyViewedSection />

      {/* Featured products */}
      <section aria-labelledby="featured-products">
        <Container className="py-14 sm:py-16">
          <Reveal>
            <SectionHeader
              id="featured-products"
              title="Featured for you"
              subtitle="Hand-picked essentials at clear, honest prices."
              href="/shop"
            />
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
        <Container className="pb-6 pt-2 sm:pb-8">
          <Reveal variant="scale">
            <div className="promo-band flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[1.75rem] px-6 py-10 text-center sm:px-10 lg:flex-row lg:text-left">
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-shop_orange">
                  Local delivery
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {siteConfig.home.promoHeadline ||
                    `Free delivery on orders above ${formatPrice(siteConfig.delivery.freeDeliveryAbove)}`}
                </h2>
                <p className="mt-2 text-sm text-white/85 sm:text-[15px]">
                  {siteConfig.home.promoSubcopy ||
                    `${siteConfig.delivery.estimate}. Pay with COD, bank transfer, EasyPaisa or JazzCash.`}
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-shop_btn_dark_green px-8 text-[15px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(220,38,38,0.85)] transition duration-200 hover:bg-shop_leaf"
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
        className="border-y border-shop_orange/10 bg-gradient-to-b from-shop_light_pink/70 via-white to-white"
      >
        <Container className="py-14 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-shop_orange/15 text-shop_orange">
                  <ClipboardList className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="store-kicker">Prescriptions</p>
                  <h2
                    id="order-by-prescription"
                    className="store-heading mt-2 text-2xl sm:text-3xl"
                  >
                    {siteConfig.home.rxOrderHeadline}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-lightColor sm:text-base">
                    {siteConfig.home.rxOrderSubcopy}
                  </p>
                </div>
              </div>
            </Reveal>

            <ol className="mt-9 space-y-4">
              {siteConfig.home.rxOrderSteps.map((step, index) => (
                <Reveal
                  key={step}
                  as="li"
                  delayMs={index * 80}
                  className="flex gap-3 rounded-2xl bg-white/80 p-3.5 ring-1 ring-shop_dark_green/8 sm:gap-4 sm:p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shop_btn_dark_green text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-darkColor sm:text-[15px]">
                    {step}
                  </p>
                </Reveal>
              ))}
            </ol>

            <Reveal delayMs={240}>
              <div className="mt-8">
                <Link
                  href="/order-by-prescription"
                  className="btn-cta h-12 px-8 text-[15px]"
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
      <section aria-labelledby="best-sellers" className="store-mesh">
        <Container className="py-14 sm:py-16">
          <Reveal>
            <SectionHeader
              id="best-sellers"
              title="Best sellers"
              subtitle="Most ordered products from real customer purchases."
              href="/shop"
            />
          </Reveal>
          <Reveal>
            <ProductCarousel products={bestSellers} />
          </Reveal>
        </Container>
      </section>

      {/* Recently added */}
      <section aria-labelledby="recently-added">
        <Container className="py-14 sm:py-16">
          <Reveal>
            <SectionHeader
              id="recently-added"
              title="Recently added"
              subtitle="Fresh arrivals just added to the Pharmaco catalog."
              href="/shop?sort=newest"
            />
          </Reveal>
          <Reveal>
            <ProductCarousel products={recentlyAdded} />
          </Reveal>
        </Container>
      </section>

      {/* Why choose Pharmaco */}
      <section aria-labelledby="why-pharmaco">
        <Container className="py-14 sm:py-16">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="store-kicker">Why Pharmaco</p>
              <h2
                id="why-pharmaco"
                className="store-heading mt-2 text-2xl sm:text-3xl"
              >
                Care you can trust in Hayatabad
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, index) => (
              <Reveal key={item.title} delayMs={index * 80}>
                <div className="h-full rounded-2xl bg-white/80 p-5 ring-1 ring-shop_dark_green/8 transition duration-300 hover:-translate-y-0.5 hover:bg-white sm:p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-shop_mist text-shop_dark_green">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-darkColor sm:text-[15px]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-lightColor">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Service information */}
      <section aria-label="Service information" className="store-surface-soft">
        <Container className="py-10">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
                <p className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/80 px-4 py-4 text-sm text-lightColor ring-1 ring-shop_dark_green/8">
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

      {/* Brand logos strip */}
      <section aria-labelledby="brand-logos" className="border-y border-shop_dark_green/8 bg-white">
        <Container className="py-10 sm:py-12">
          <Reveal>
            <div className="mb-6 text-center">
              <p className="store-kicker">Partners</p>
              <h2 id="brand-logos" className="store-heading mt-2 text-xl sm:text-2xl">
                Brands we stock
              </h2>
            </div>
          </Reveal>
          <Reveal>
            <BrandLogoStrip brands={brands} />
          </Reveal>
        </Container>
      </section>

      {/* Location map */}
      <section aria-label="Pharmacy location">
        <Container className="pb-16 pt-6 sm:pb-20">
          <Reveal variant="fade">
            <div className="overflow-hidden rounded-[1.75rem] ring-1 ring-shop_dark_green/10">
              <GoogleMap />
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
};

export default Home;
