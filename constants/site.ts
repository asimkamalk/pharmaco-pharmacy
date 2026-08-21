/**
 * Central place for business information.
 *
 * NOTE: Values marked [PLACEHOLDER] are intentionally not real.
 * Replace them with the actual Pharmaco Pharmacy details before going live.
 */
export const siteConfig = {
  name: "Pharmaco Pharmacy",
  shortName: "Pharmaco",
  tagline: "Your trusted pharmacy in Hayatabad, Peshawar",
  description:
    "Pharmaco Pharmacy is a trusted pharmacy in Hayatabad, Peshawar, offering medicines, healthcare products, wellness essentials, and personal care items.",
  location: {
    area: "Hayatabad",
    city: "Peshawar",
    country: "Pakistan",
    /** [PLACEHOLDER] Replace with the real street address. */
    address: "[Street Address], Hayatabad, Peshawar",
  },
  contact: {
    /** [PLACEHOLDER] Replace with the real phone number. */
    phone: "+92 XXX XXXXXXX",
    /** [PLACEHOLDER] Replace with the real WhatsApp number. */
    whatsapp: "+92 XXX XXXXXXX",
    /** [PLACEHOLDER] Replace with the real email address. */
    email: "info@example.com",
    /** [PLACEHOLDER] Replace with the real opening hours. */
    openingHours: "Mon – Sun: 9:00 AM – 11:00 PM",
  },
  delivery: {
    /** [PLACEHOLDER] Standard delivery charges in PKR — update to the real fee. */
    standardFee: 150,
    /** [PLACEHOLDER] Order subtotal (PKR) above which delivery is free. */
    freeDeliveryAbove: 2000,
    /** [PLACEHOLDER] Delivery estimate copy shown to customers. */
    estimate: "Same-day delivery within Hayatabad, 1–2 days across Peshawar",
  },
  /**
   * Manual payment accounts — customers pay and share a transaction reference.
   * Orders stay pending until Pharmaco verifies the payment.
   */
  payments: {
    bankTransfer: {
      bankName: "[Bank Name]",
      accountTitle: "Pharmaco Pharmacy",
      accountNumber: "[Account Number]",
      iban: "[IBAN]",
    },
    easyPaisa: {
      accountTitle: "Pharmaco Pharmacy",
      /** [PLACEHOLDER] EasyPaisa mobile account number */
      mobileNumber: "03XX XXXXXXX",
    },
    jazzCash: {
      accountTitle: "Pharmaco Pharmacy",
      /** [PLACEHOLDER] JazzCash mobile account number */
      mobileNumber: "03XX XXXXXXX",
    },
  },
  /**
   * Google Maps embed for Hayatabad, Peshawar.
   * Replace with your exact pharmacy pin when ready.
   */
  map: {
    embedUrl:
      "https://www.google.com/maps?q=Hayatabad,+Peshawar,+Pakistan&output=embed",
    linkUrl:
      "https://www.google.com/maps/search/?api=1&query=Hayatabad+Peshawar+Pakistan",
  },
} as const;

export const currency = {
  code: "PKR",
  symbol: "Rs.",
} as const;
