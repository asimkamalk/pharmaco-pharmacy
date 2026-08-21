import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  HeartHandshake,
  MapPin,
  Stethoscope,
  Truck,
} from "lucide-react";
import Container from "@/components/Container";
import GoogleMap from "@/components/GoogleMap";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${siteConfig.name}, a community pharmacy in ${siteConfig.location.area}, ${siteConfig.location.city}, offering medicines, healthcare and wellness products.`,
};

const values = [
  {
    icon: BadgeCheck,
    title: "Genuine Products",
    description:
      "We stock medicines and healthcare products sourced from authorised distributors.",
  },
  {
    icon: Stethoscope,
    title: "Professional Care",
    description:
      "Prescription medicines are dispensed responsibly under pharmacist supervision.",
  },
  {
    icon: Truck,
    title: "Convenient Delivery",
    description: siteConfig.delivery.estimate + ".",
  },
  {
    icon: HeartHandshake,
    title: "Community First",
    description:
      "We serve the families of Hayatabad and Peshawar with honest advice and fair prices.",
  },
];

const AboutPage = () => {
  return (
    <main className="bg-white">
      <section className="bg-shop_light_pink">
        <Container className="py-12 text-center sm:py-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-shop_dark_green">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {siteConfig.location.area}, {siteConfig.location.city},{" "}
            {siteConfig.location.country}
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-bold text-darkColor sm:text-4xl">
            About {siteConfig.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-lightColor sm:text-base">
            {siteConfig.name} is a community pharmacy based in{" "}
            {siteConfig.location.area}, {siteConfig.location.city}. We provide
            medicines, vitamins and supplements, personal care, baby care and
            home medical equipment — in store and online.
          </p>
        </Container>
      </section>

      <section aria-labelledby="our-values">
        <Container className="py-12 sm:py-14">
          <h2
            id="our-values"
            className="text-center text-xl font-bold text-darkColor sm:text-2xl"
          >
            What We Stand For
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-black/10 bg-white p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-shop_light_pink">
                  <value.icon
                    className="h-5 w-5 text-shop_dark_green"
                    aria-hidden
                  />
                </span>
                <h3 className="mt-3.5 text-sm font-semibold text-darkColor">
                  {value.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-lightColor">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="how-we-work" className="bg-shop_light_bg/60">
        <Container className="py-12 sm:py-14">
          <div className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-lightColor">
            <h2
              id="how-we-work"
              className="text-xl font-bold text-darkColor sm:text-2xl"
            >
              How We Work
            </h2>
            <p>
              Browse our catalog online, add items to your cart and place your
              order with Cash on Delivery, bank transfer, EasyPaisa or JazzCash.
              Our team prepares your order and delivers it to your doorstep.
            </p>
            <p>
              Medicines that require a prescription are clearly marked across
              the store. For these items, a valid prescription is requested
              during checkout and reviewed before the order is completed. We do
              not provide medical advice online — please consult your doctor or
              visit our pharmacists for guidance about your medicines.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-shop_btn_dark_green px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-black/15 bg-white px-6 text-sm font-semibold text-darkColor transition-colors duration-200 hover:border-shop_light_green hover:text-shop_light_green"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section aria-label="Pharmacy location" className="bg-white">
        <Container className="py-12 sm:py-14">
          <GoogleMap
            title="Visit Pharmaco in Hayatabad"
            description={`Find ${siteConfig.name} on the map — ${siteConfig.location.area}, ${siteConfig.location.city}.`}
          />
        </Container>
      </section>
    </main>
  );
};

export default AboutPage;
