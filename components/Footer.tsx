import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Container from "./Container";
import Logo from "./Logo";
import SocialMedia from "./SocialMedia";
import { headerData, categoriesData } from "@/constants/data";
import { siteConfig } from "@/constants/site";

const customerServiceLinks = [
  { title: "Contact Us", href: "/contact" },
  { title: "My Account", href: "/account" },
  { title: "My Orders", href: "/account/orders" },
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms & Conditions", href: "/terms" },
];

const Footer = () => {
  return (
    <footer className="border-t border-black/10 bg-white">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-lightColor">
              {siteConfig.name} — your neighbourhood pharmacy in{" "}
              {siteConfig.location.area}, {siteConfig.location.city}. Medicines,
              healthcare products and wellness essentials, delivered with care.
            </p>
            <SocialMedia
              className="text-lightColor"
              iconClassName="border-lightColor/40 hover:border-shop_light_green hover:text-shop_light_green"
              tooltipClassName="bg-darkColor text-white"
            />
          </div>

          <nav aria-label="Quick links" className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-darkColor">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {headerData.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-lightColor transition-colors duration-200 hover:text-shop_light_green"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Categories" className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-darkColor">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {categoriesData.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="text-sm text-lightColor transition-colors duration-200 hover:text-shop_light_green"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-darkColor">
              Customer Service
            </h3>
            <ul className="space-y-2.5">
              {customerServiceLinks.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-lightColor transition-colors duration-200 hover:text-shop_light_green"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            <address className="space-y-2.5 text-sm not-italic text-lightColor">
              <p className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-shop_light_green"
                  aria-hidden
                />
                {siteConfig.location.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone
                  className="h-4 w-4 shrink-0 text-shop_light_green"
                  aria-hidden
                />
                {siteConfig.contact.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail
                  className="h-4 w-4 shrink-0 text-shop_light_green"
                  aria-hidden
                />
                {siteConfig.contact.email}
              </p>
              <p className="flex items-center gap-2">
                <Clock
                  className="h-4 w-4 shrink-0 text-shop_light_green"
                  aria-hidden
                />
                {siteConfig.contact.openingHours}
              </p>
            </address>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-black/10 py-5 sm:flex-row">
          <p className="text-center text-xs text-lightColor sm:text-left">
            &copy; {new Date().getFullYear()} {siteConfig.name},{" "}
            {siteConfig.location.area}, {siteConfig.location.city}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-lightColor">
            <Link
              href="/privacy"
              className="transition-colors duration-200 hover:text-shop_light_green"
            >
              Privacy Policy
            </Link>
            <span aria-hidden>•</span>
            <Link
              href="/terms"
              className="transition-colors duration-200 hover:text-shop_light_green"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
