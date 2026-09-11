import Image from "next/image";
import Link from "next/link";
import AddToWishlistButton from "./AddToWishlistButton";
import PriceView from "./PriceView";
import ProductPurchaseControls from "./ProductPurchaseControls";
import { listPriceForPack, isSingleStripBox } from "@/lib/pack";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const categoryTitle = product.categoryTitle;
  const outOfStock = product.stock <= 0;
  const singleStripBox = isSingleStripBox(product);
  const showStripPrice = Boolean(product.sellByStrip) && !singleStripBox;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-shop_dark_green/10 transition duration-300 hover:-translate-y-0.5 hover:ring-shop_light_green/35">
      <div className="relative overflow-hidden bg-gradient-to-b from-shop_mist/80 to-shop_light_bg">
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
            className={`aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
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
              Rx
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

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        {categoryTitle && (
          <Link
            href={`/shop?category=${product.categorySlug}`}
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-shop_light_green transition-colors duration-200 hover:text-shop_dark_green"
          >
            {categoryTitle}
          </Link>
        )}

        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-darkColor">
          <Link
            href={`/product/${product.slug}`}
            className="transition-colors duration-200 hover:text-shop_dark_green"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto space-y-2.5 pt-2">
          <div className="space-y-0.5">
            <PriceView
              price={product.price}
              discount={product.discount}
              unitSuffix={product.sellByStrip ? "/ box" : undefined}
            />
            {showStripPrice ? (
              <PriceView
                price={listPriceForPack(product, "strip")}
                discount={product.discount}
                unitSuffix="/ strip"
              />
            ) : null}
          </div>
          <ProductPurchaseControls product={product} layout="card" />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
