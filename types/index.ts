export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  /**
   * Category image URL. Placeholder until the admin dashboard
   * supports uploads; then this can point to uploaded storage.
   */
  image: string;
}

export interface Brand {
  id: string;
  title: string;
  slug: string;
  description: string;
  /**
   * Brand logo/image URL. Placeholder until admin uploads are available.
   */
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  /** Links the product to a brand in `brandsData`. */
  brandSlug: string;
  /** Current list price in PKR. */
  price: number;
  /** Discount percentage (0–100). When > 0, the discounted price applies. */
  discount: number;
  stock: number;
  sku: string;
  images: string[];
  requiresPrescription: boolean;
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
  /** Medicine-specific fields (optional for non-medicine products). */
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
  /** Custom label when label === "other" */
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
  /** Transaction / reference ID entered by the customer for manual payments. */
  paymentReference?: string;
  /** Optional note or screenshot filename reference for prescription. */
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
  grandTotal: number;
}
