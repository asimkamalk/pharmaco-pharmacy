"use client";

import ProductPurchaseControls from "@/components/ProductPurchaseControls";
import type { PackType, Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  packType?: PackType;
}

const AddToCartButton = ({
  product,
  className,
  packType,
}: AddToCartButtonProps) => {
  return (
    <ProductPurchaseControls
      product={product}
      layout="compact"
      packType={packType}
      className={className}
    />
  );
};

export default AddToCartButton;
