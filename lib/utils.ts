import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `Rs. ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

/** Final selling price after applying the product's discount percentage. */
export function getDiscountedPrice(price: number, discount: number): number {
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
}
