import type { Metadata } from "next";
import type { SiteConfig } from "@/constants/site";
import type { Product } from "@/types";
import { getDiscountedPrice } from "@/lib/utils";

export function getSiteUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    process.env.VERCEL_URL;
  if (!fromEnv) return "http://localhost:3000";
  if (fromEnv.startsWith("http")) return fromEnv.replace(/\/$/, "");
  return `https://${fromEnv.replace(/\/$/, "")}`;
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function phoneToE164(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  return digits;
}

/** Parse "Mon – Sun: 9:00 AM – 11:00 PM" into Schema.org OpeningHoursSpecification */
function openingHoursSpec(hours: string) {
  const match = hours.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i,
  );
  if (!match) return undefined;

  const to24 = (h: number, m: string, meridiem: string) => {
    let hour = h % 12;
    if (meridiem.toUpperCase() === "PM") hour += 12;
    return `${String(hour).padStart(2, "0")}:${m}`;
  };

  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: to24(Number(match[1]), match[2], match[3]),
    closes: to24(Number(match[4]), match[5], match[6]),
  };
}

export function buildLocalBusinessJsonLd(site: SiteConfig) {
  const url = getSiteUrl();
  const logo = absoluteUrl(site.branding.logoUrl);
  const hours = openingHoursSpec(site.contact.openingHours);

  return {
    "@context": "https://schema.org",
    "@type": ["Pharmacy", "LocalBusiness", "Store"],
    "@id": `${url}/#pharmacy`,
    name: site.name,
    description: site.seo.description || site.description,
    url,
    image: logo,
    logo,
    telephone: phoneToE164(site.contact.phone),
    email: site.contact.email,
    priceRange: "$$",
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash, Bank Transfer, EasyPaisa, JazzCash",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.location.address,
      addressLocality: site.location.city,
      addressRegion: "Khyber Pakhtunkhwa",
      postalCode: "25100",
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
  // Approximate coordinates from Google Maps embed for Pharmaco Pharmacy
  latitude: 33.97493020404854,
  longitude: 71.42378977908297,
    },
    hasMap: site.map.linkUrl,
    sameAs: [
      site.map.linkUrl,
      site.social.facebook,
      site.social.instagram,
      site.social.tiktok,
      site.social.twitter,
    ].filter((href) => href && !href.endsWith("/")),
    areaServed: [
      {
        "@type": "Place",
        name: `${site.location.area}, ${site.location.city}`,
      },
      { "@type": "City", name: site.location.city },
    ],
    ...(hours ? { openingHoursSpecification: [hours] } : {}),
  };
}

export function buildWebsiteJsonLd(site: SiteConfig) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: site.name,
    url,
    description: site.seo.description || site.description,
    publisher: { "@id": `${url}/#pharmacy` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProductJsonLd(product: Product, site: SiteConfig) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const price = getDiscountedPrice(product.price, product.discount);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((image) => absoluteUrl(image)),
    brand: product.brandSlug
      ? { "@type": "Brand", name: product.brandSlug }
      : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      price: price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Pharmacy",
        name: site.name,
      },
    },
  };
}

export function buildRootMetadata(site: SiteConfig): Metadata {
  const title = site.seo.title || site.name;
  const description = site.seo.description || site.description;
  const url = getSiteUrl();
  const ogImage = absoluteUrl(site.branding.logoUrl);

  return {
    metadataBase: new URL(url),
    title: {
      template: `%s | ${site.shortName}`,
      default: title,
    },
    description,
    applicationName: site.name,
    keywords: [
      "pharmacy",
      "Pharmaco Pharmacy",
      "Hayatabad pharmacy",
      "Peshawar medicines",
      "online pharmacy Pakistan",
      "healthcare products",
      site.location.area,
      site.location.city,
    ],
    authors: [{ name: site.name }],
    creator: site.name,
    publisher: site.name,
    category: "health",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_PK",
      url,
      siteName: site.name,
      title,
      description,
      images: [
        {
          url: ogImage,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "geo.region": "PK-KP",
      "geo.placename": `${site.location.area}, ${site.location.city}`,
    },
  };
}
