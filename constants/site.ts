export type WhyChooseItem = {
  title: string;
  description: string;
};

export type SiteConfig = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  location: {
    area: string;
    city: string;
    country: string;
    address: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    openingHours: string;
  };
  delivery: {
    standardFee: number;
    freeDeliveryAbove: number;
    estimate: string;
  };
  payments: {
    bankTransfer: {
      bankName: string;
      accountTitle: string;
      accountNumber: string;
      iban: string;
    };
    easyPaisa: {
      accountTitle: string;
      mobileNumber: string;
    };
    jazzCash: {
      accountTitle: string;
      mobileNumber: string;
    };
  };
  map: {
    embedUrl: string;
    linkUrl: string;
  };
  branding: {
    logoUrl: string;
  };
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    twitter: string;
  };
  seo: {
    title: string;
    description: string;
  };
  home: {
    heroEyebrow: string;
    heroHeadline: string;
    heroSubcopy: string;
    heroCtaPrimaryLabel: string;
    heroCtaPrimaryHref: string;
    heroCtaSecondaryLabel: string;
    heroCtaSecondaryHref: string;
    heroBackgroundUrl: string;
    heroImageUrl: string;
    promoHeadline: string;
    promoSubcopy: string;
    whyChoose: WhyChooseItem[];
  };
};

/** Fallback defaults used before DB seed / if DB is empty */
export const defaultSiteConfig: SiteConfig = {
  name: "Pharmaco Pharmacy",
  shortName: "Pharmaco",
  tagline: "Your trusted pharmacy in Hayatabad, Peshawar",
  description:
    "Pharmaco Pharmacy is a trusted pharmacy in Hayatabad, Peshawar, offering medicines, healthcare products, wellness essentials, and personal care items.",
  location: {
    area: "Hayatabad",
    city: "Peshawar",
    country: "Pakistan",
    address: "Shop 36, Sector D5 Phase 1 Hayatabad, Peshawar, 25100, Pakistan",
  },
  contact: {
    phone: "+92 332 7373354",
    whatsapp: "+92 332 7373354",
    email: "info@pharmaco.pk",
    openingHours: "Mon – Sun: 9:00 AM – 11:00 PM",
  },
  delivery: {
    standardFee: 150,
    freeDeliveryAbove: 2000,
    estimate: "Same-day delivery within Hayatabad, 1–2 days across Peshawar",
  },
  payments: {
    bankTransfer: {
      bankName: "[Bank Name]",
      accountTitle: "Pharmaco Pharmacy",
      accountNumber: "[Account Number]",
      iban: "[IBAN]",
    },
    easyPaisa: {
      accountTitle: "Pharmaco Pharmacy",
      mobileNumber: "0332 7373354",
    },
    jazzCash: {
      accountTitle: "Pharmaco Pharmacy",
      mobileNumber: "0332 7373354",
    },
  },
  map: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3308.685187864989!2d71.42378977908297!3d33.97493020404854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d911005f142e31%3A0xb08a8f5515a8c1ad!2sPharmaco%20Pharmacy!5e0!3m2!1sen!2sus!4v1787342592711!5m2!1sen!2sus",
    linkUrl: "https://maps.app.goo.gl/RRzaApoHHqsozbdy8",
  },
  branding: {
    logoUrl: "/images/pharmaco-logo-text.png",
  },
  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    twitter: "https://x.com/",
  },
  seo: {
    title:
      "Pharmaco Pharmacy | Medicines & Healthcare in Hayatabad, Peshawar",
    description:
      "Shop genuine medicines, healthcare products and wellness essentials at Pharmaco Pharmacy — Shop 36, Sector D5 Phase 1 Hayatabad, Peshawar. Call +92 332 7373354.",
  },
  home: {
    heroEyebrow: "",
    heroHeadline: "Your health, delivered with care",
    heroSubcopy:
      "Genuine medicines, wellness essentials and personal care — with pharmacist support and fast local delivery across Peshawar.",
    heroCtaPrimaryLabel: "Shop now",
    heroCtaPrimaryHref: "/shop",
    heroCtaSecondaryLabel: "Contact us",
    heroCtaSecondaryHref: "/contact",
    heroBackgroundUrl: "",
    heroImageUrl: "/images/pharmaco-logo.png",
    promoHeadline: "Free delivery on qualifying orders",
    promoSubcopy: "Pay with COD, bank transfer, EasyPaisa or JazzCash.",
    whyChoose: [
      {
        title: "Genuine Products",
        description:
          "Medicines and healthcare products sourced from authorised distributors.",
      },
      {
        title: "Licensed Pharmacists",
        description:
          "Orders are reviewed and dispensed under professional supervision.",
      },
      {
        title: "Fast Local Delivery",
        description:
          "Same-day delivery within Hayatabad, 1–2 days across Peshawar.",
      },
      {
        title: "Safe & Secure",
        description:
          "Prescription-required items are clearly marked and verified at checkout.",
      },
    ],
  },
};

/** @deprecated Prefer getSiteConfig() / useSiteConfig() — kept for gradual migration */
export const siteConfig = defaultSiteConfig;

export const currency = {
  code: "PKR",
  symbol: "Rs.",
} as const;
