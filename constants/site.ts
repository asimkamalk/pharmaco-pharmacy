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
    address: "[Street Address], Hayatabad, Peshawar",
  },
  contact: {
    phone: "+92 XXX XXXXXXX",
    whatsapp: "+92 XXX XXXXXXX",
    email: "info@example.com",
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
      mobileNumber: "03XX XXXXXXX",
    },
    jazzCash: {
      accountTitle: "Pharmaco Pharmacy",
      mobileNumber: "03XX XXXXXXX",
    },
  },
  map: {
    embedUrl:
      "https://www.google.com/maps?q=Hayatabad,+Peshawar,+Pakistan&output=embed",
    linkUrl:
      "https://www.google.com/maps/search/?api=1&query=Hayatabad+Peshawar+Pakistan",
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
    title: "Pharmaco Pharmacy | Hayatabad, Peshawar",
    description:
      "Medicines, healthcare products, wellness essentials and personal care items from a trusted pharmacy in Hayatabad, Peshawar.",
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
