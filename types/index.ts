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

export interface CartItem {
  product: Product;
  quantity: number;
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
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  prescriptionReference?: string;
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
  deliveryFee: number;
  costTotal?: number;
  grandTotal: number;
  userId?: string | null;
}
