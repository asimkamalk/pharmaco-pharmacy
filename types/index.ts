export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
}

export interface Brand {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  /** Short plain-text description */
  description: string;
  /** Rich HTML long description */
  longDescription?: string;
  /** SEO meta description (~160 chars) for Google & social */
  metaDescription?: string;
  /** Optional SEO title (defaults to product name) */
  metaTitle?: string;
  categorySlug: string;
  categoryTitle?: string;
  brandSlug: string;
  brandTitle?: string;
  /** Selling price before discount (PKR). */
  price: number;
  /** Purchase / cost price (PKR). Shown in admin; optional on storefront. */
  purchasePrice?: number;
  discount: number;
  stock: number;
  sku: string;
  images: string[];
  requiresPrescription: boolean;
  /** Offers full box + single strip purchase */
  sellByStrip?: boolean;
  /** Tablets/capsules per strip */
  unitsPerStrip?: number;
  /** Strips inside one complete box */
  stripsPerBox?: number;
  /** Price for one strip (box uses `price`) */
  stripPrice?: number;
  /** Optional strip cost; else purchasePrice / stripsPerBox */
  stripPurchasePrice?: number;
  isFeatured: boolean;
  isArchived?: boolean;
  rating?: number;
  reviewCount?: number;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  createdAt: string;
}

export type PackType = "unit" | "box" | "strip";

export interface CartItem {
  product: Product;
  quantity: number;
  /** How this line is sold. Box = complete pack; strip = single strip. */
  packType: PackType;
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "name";

export interface ProductFilters {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
  /** Admin-only: include archived products */
  includeArchived?: boolean;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type AddressLabel = "home" | "office" | "other";

export type AddressRegion = "hayatabad" | "outside";

export type HayatabadPhase =
  | "Phase 1"
  | "Phase 2"
  | "Phase 3"
  | "Phase 4"
  | "Phase 5"
  | "Phase 6"
  | "Phase 7";

export interface SavedAddress {
  id: string;
  label: AddressLabel;
  customLabel?: string;
  fullName: string;
  phone: string;
  email?: string;
  addressLine: string;
  area: string;
  city: string;
  notes?: string;
  isDefault: boolean;
  /** How the address was entered */
  region?: AddressRegion;
  /** Hayatabad structured fields */
  houseNo?: string;
  streetNo?: string;
  sectorNo?: string;
  phase?: HayatabadPhase | string;
}

export type PaymentMethod =
  | "cash_on_delivery"
  | "bank_transfer"
  | "easypaisa"
  | "jazzcash";

export type PaymentStatus =
  | "not_required"
  | "awaiting_proof"
  | "pending_verification"
  | "verified"
  | "failed";

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  slug: string;
  image: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  purchasePrice?: number;
  discount: number;
  requiresPrescription: boolean;
  /** unit | box | strip */
  packType?: PackType;
  /** @deprecated use packType */
  soldAsStrip?: boolean;
  unitsPerStrip?: number;
  stripsPerBox?: number;
}

export type PrescriptionStatus =
  | "not_required"
  | "pending_review"
  | "approved"
  | "rejected";

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  prescriptionReference?: string;
  prescriptionUrl?: string;
  prescriptionFileName?: string;
  prescriptionMimeType?: string;
  prescriptionStatus?: PrescriptionStatus;
  prescriptionAdminNote?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    label: AddressLabel;
    customLabel?: string;
    addressLine: string;
    area: string;
    city: string;
  };
  orderNotes?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discountTotal: number;
  customerDiscountPercent?: number;
  customerDiscountAmount?: number;
  deliveryFee: number;
  deliveryZoneLabel?: string;
  costTotal?: number;
  grandTotal: number;
  userId?: string | null;
  /** Total orders placed by this registered customer (admin). */
  customerOrderCount?: number;
}
