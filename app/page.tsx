import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Truck,
} from "lucide-react";
import Container from "@/components/Container";
import GoogleMap from "@/components/GoogleMap";
import ProductCard from "@/components/ProductCard";
import {
  getBestSellers,
  getBrands,
  getCategories,
  getFeaturedProducts,
} from "@/lib/products";
import { siteConfig } from "@/constants/site";
import { formatPrice } from "@/lib/utils";

const whyChooseUs = [
  {
    icon: BadgeCheck,
    title: "Genuine Products",
    description:
      "Medicines and healthcare products sourced from authorised distributors.",
  },
  {
    icon: Stethoscope,
    title: "Licensed Pharmacists",
    description:
      "Orders are reviewed and dispensed under professional supervision.",
  },
  {
    icon: Truck,
    title: "Fast Local Delivery",
    description: siteConfig.delivery.estimate,
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    description:
      "Prescription-required items are clearly marked and verified at checkout.",
  },
];

const Home = async () => {
  const [categories, brands, featuredProducts, bestSellers] = await Promise.all(
    [
      getCategories(),
      getBrands(),
      getFeaturedProducts(8),
      getBestSellers(4),
    ],
  );

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-shop_light_pink via-white to-shop_light_bg">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-shop_light_green/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-shop_orange/10 blur-3xl"
        />
        <Container className="relative grid grid-cols-1 items-center gap-8 py-14 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-shop_dark_green/10 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-shop_dark_green shadow-sm">
              <HeartPulse className="h-3.5 w-3.5" aria-hidden />
              {siteConfig.name} — {siteConfig.location.area},{" "}
              {siteConfig.location.city}
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-darkColor sm:text-4xl lg:text-5xl">
              Your health, delivered{" "}
              <span className="text-shop_dark_green">with care</span>
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-lightColor sm:text-base">
              Order medicines, vitamins, personal care and medical supplies
              from your trusted neighbourhood pharmacy — with convenient
              delivery across {siteConfig.location.city}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-shop_btn_dark_green px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/categories"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-shop_dark_green/20 bg-white px-6 text-sm font-semibold text-shop_dark_green transition-colors duration-200 hover:border-shop_dark_green/50"
              >
                Browse Categories
              </Link>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              src="/images/pharmaco-logo.png"
              alt=""
              aria-hidden
              width={693}
              height={693}
              priority
              sizes="400px"
              className="h-auto w-80 object-contain opacity-90"
            />
          </div>
        </Container>
      </section>

      {/* Popular categories */}
      <section aria-labelledby="popular-categories">
        <Container className="py-12 sm:py-14">
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group rounded-xl border border-black/10 bg-white p-3 text-center transition-all duration-300 hover:border-shop_light_green/50 hover:shadow-md sm:p-4"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-shop_light_pink sm:h-16 sm:w-16">
                  <Image
                    src={category.image}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="mt-3 block text-sm font-semibold text-darkColor">
                  {category.title}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Shop by brand */}
      <section aria-labelledby="shop-brands" className="bg-shop_light_bg/50">
        <Container className="py-12 sm:py-14">
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/shop?brand=${brand.slug}`}
                className="group flex flex-col items-center rounded-xl border border-black/10 bg-white p-3 text-center transition-all duration-300 hover:border-shop_light_green/50 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-black/5 bg-shop_light_bg sm:h-16 sm:w-16">
                  <Image
                    src={brand.image}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="mt-2.5 line-clamp-2 text-xs font-semibold text-darkColor sm:text-sm">
                  {brand.title}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section aria-labelledby="featured-products" className="bg-shop_light_bg/60">
        <Container className="py-12 sm:py-14">
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

          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* Promo banner */}
      <section aria-label="Delivery offer">
        <Container className="py-12 sm:py-14">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-shop_dark_green px-6 py-10 text-center sm:px-10 lg:flex-row lg:text-left">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Free delivery on orders above{" "}
                {formatPrice(siteConfig.delivery.freeDeliveryAbove)}
              </h2>
              <p className="mt-2 text-sm text-white/80">
                {siteConfig.delivery.estimate}. Pay with COD, bank transfer,
                EasyPaisa or JazzCash.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-shop_dark_green transition-colors duration-200 hover:bg-shop_light_pink"
            >
              Order Now
            </Link>
          </div>
        </Container>
      </section>

      {/* Best sellers */}
      <section aria-labelledby="best-sellers">
        <Container className="pb-12 sm:pb-14">
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
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* Why choose Pharmaco */}
      <section aria-labelledby="why-pharmaco" className="bg-shop_light_bg/60">
        <Container className="py-12 sm:py-14">
          <h2
            id="why-pharmaco"
            className="text-center text-xl font-bold text-darkColor sm:text-2xl"
          >
            Why Choose {siteConfig.shortName}?
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-black/10 bg-white p-5"
              >
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
            ))}
          </div>
        </Container>
      </section>

      {/* Service information */}
      <section aria-label="Service information">
        <Container className="py-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <p className="flex items-center justify-center gap-2.5 rounded-xl border border-black/10 p-4 text-sm text-lightColor">
              <Clock className="h-4 w-4 shrink-0 text-shop_light_green" aria-hidden />
              {siteConfig.contact.openingHours}
            </p>
            <p className="flex items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white p-4 text-sm text-lightColor shadow-sm">
              <Truck className="h-4 w-4 shrink-0 text-shop_light_green" aria-hidden />
              COD · Bank · EasyPaisa · JazzCash
            </p>
            <p className="flex items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white p-4 text-sm text-lightColor shadow-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-shop_light_green" aria-hidden />
              Prescription medicines handled responsibly
            </p>
          </div>
        </Container>
      </section>

      {/* Location map */}
      <section aria-label="Pharmacy location">
        <Container className="pb-14 pt-4 sm:pb-16">
          <GoogleMap />
        </Container>
      </section>
    </main>
  );
};

export default Home;
