import { cn, formatPrice, getDiscountedPrice } from "@/lib/utils";

interface PriceViewProps {
  price: number;
  discount: number;
  className?: string;
  /** e.g. "per strip" */
  unitSuffix?: string;
}

const PriceView = ({
  price,
  discount,
  className,
  unitSuffix,
}: PriceViewProps) => {
  const currentPrice = getDiscountedPrice(price, discount);
  const hasDiscount = discount > 0;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className="font-semibold text-shop_dark_green">
        {formatPrice(currentPrice)}
        {unitSuffix ? (
          <span className="ml-1 text-xs font-medium text-lightColor">
            {unitSuffix}
          </span>
        ) : null}
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
