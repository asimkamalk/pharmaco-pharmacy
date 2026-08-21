import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import AddToWishlistButton from "./AddToWishlistButton";
import PriceView from "./PriceView";
import StarRating from "./StarRating";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const categoryTitle = product.categoryTitle;
  const outOfStock = product.stock <= 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition-shadow duration-300 hover:shadow-md">
      <div className="relative overflow-hidden bg-shop_light_bg">
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              outOfStock ? "opacity-60" : ""
            }`}
          />
        </Link>

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {product.discount > 0 && (
            <span className="rounded-md bg-shop_orange px-2 py-0.5 text-xs font-semibold text-white">
              -{product.discount}%
            </span>
          )}
          {product.requiresPrescription && (
            <span className="rounded-md bg-shop_dark_green px-2 py-0.5 text-xs font-semibold text-white">
              Prescription Required
            </span>
          )}
          {outOfStock && (
            <span className="rounded-md bg-darkColor/80 px-2 py-0.5 text-xs font-semibold text-white">
              Out of Stock
            </span>
          )}
        </div>

        <AddToWishlistButton
          product={product}
          className="absolute right-2.5 top-2.5"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {categoryTitle && (
          <Link
            href={`/shop?category=${product.categorySlug}`}
            className="text-xs font-medium uppercase tracking-wide text-shop_light_green transition-colors duration-200 hover:text-shop_dark_green"
          >
            {categoryTitle}
          </Link>
        )}

        <h3 className="line-clamp-2 text-sm font-semibold text-darkColor">
          <Link
            href={`/product/${product.slug}`}
            className="transition-colors duration-200 hover:text-shop_dark_green"
          >
            {product.name}
          </Link>
        </h3>

        {product.rating !== undefined && (
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        )}

        <div className="mt-auto space-y-3 pt-1">
          <PriceView price={product.price} discount={product.discount} />
          <AddToCartButton product={product} className="w-full" />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
