/** Pure pricing helpers safe for client components */

export function customerDiscountAmount(
  subtotal: number,
  discountPercent: number,
) {
  const pct = Math.min(100, Math.max(0, Math.round(discountPercent || 0)));
  if (pct <= 0 || subtotal <= 0) return 0;
  return Math.round((subtotal * pct) / 100);
}
