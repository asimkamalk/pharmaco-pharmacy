import { cn, formatPrice, getDiscountedPrice } from "@/lib/utils";

interface PriceViewProps {
  price: number;
  discount: number;
  className?: string;
}

const PriceView = ({ price, discount, className }: PriceViewProps) => {
  const currentPrice = getDiscountedPrice(price, discount);
  const hasDiscount = discount > 0;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className="font-semibold text-shop_dark_green">
        {formatPrice(currentPrice)}
      </span>
      {hasDiscount && (
        <span className="text-sm font-normal text-lightColor line-through">
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
};

export default PriceView;
