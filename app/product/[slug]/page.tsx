import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ClipboardList, ShieldCheck, Truck } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import AddToWishlistButton from "@/components/AddToWishlistButton";
import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import StarRating from "@/components/StarRating";
import {
  getBrandBySlug,
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { getSiteConfig } from "@/lib/site";
import { sanitizeProductHtml } from "@/lib/sanitize";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, site] = await Promise.all([
    getProductBySlug(slug),
    getSiteConfig(),
  ]);
  if (!product) {
    notFound();
  }
  const description = product.description.slice(0, 160);
  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | ${site.name}`,
      description,
      images: product.images.map((image) => ({ url: image })),
    },
  };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [category, relatedProducts, brand, siteConfig] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getRelatedProducts(product),
    getBrandBySlug(product.brandSlug),
    getSiteConfig(),
  ]);

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 20;

  const productInformation: { label: string; value: string | undefined }[] = [
    { label: "Generic Name", value: product.genericName },
    { label: "Strength", value: product.strength },
    { label: "Dosage Form", value: product.dosageForm },
    { label: "Brand", value: brand?.title },
    { label: "Manufacturer", value: product.manufacturer },
    { label: "Category", value: category?.title },
    { label: "SKU", value: product.sku },
  ];

  return (
    <main className="bg-white">
      <Container className="py-8 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-lightColor">
            <li>
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-shop_light_green"
              >
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li>
              <Link
                href="/shop"
                className="transition-colors duration-200 hover:text-shop_light_green"
              >
                Shop
              </Link>
            </li>
            {category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                <li>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="transition-colors duration-200 hover:text-shop_light_green"
                  >
                    {category.title}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li aria-current="page" className="truncate font-medium text-darkColor">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="space-y-5">
            <div className="space-y-2">
              {category && (
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="text-xs font-medium uppercase tracking-wide text-shop_light_green transition-colors duration-200 hover:text-shop_dark_green"
                >
                  {category.title}
                </Link>
              )}
              <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
                {product.name}
              </h1>
              {product.rating !== undefined && (
                <StarRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PriceView
                price={product.price}
                discount={product.discount}
                className="text-2xl"
              />
              {product.discount > 0 && (
                <span className="rounded-md bg-shop_orange px-2 py-0.5 text-xs font-semibold text-white">
                  Save {product.discount}%
                </span>
              )}
            </div>

            <p
              className={`text-sm font-semibold ${
                inStock ? "text-shop_light_green" : "text-shop_orange"
              }`}
            >
              {inStock
                ? lowStock
                  ? `In stock — only ${product.stock} left`
                  : "In stock"
                : "Out of stock"}
            </p>

            {product.requiresPrescription && (
              <div className="flex items-start gap-3 rounded-lg border border-shop_orange/30 bg-shop_light_pink p-4">
                <ClipboardList
                  className="mt-0.5 h-5 w-5 shrink-0 text-shop_orange"
                  aria-hidden
                />
                <div className="text-sm">
                  <p className="font-semibold text-darkColor">
                    Prescription Required
                  </p>
                  <p className="mt-0.5 text-lightColor">
                    A valid prescription must be provided during checkout
                    before this order can be completed.
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm leading-relaxed text-lightColor">
              {product.description}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AddToCartButton
                product={product}
                className="h-11 w-full sm:w-56"
              />
              <AddToWishlistButton
                product={product}
                className="h-11 w-11 self-start rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl border border-black/10 bg-shop_light_bg/50 p-4 sm:grid-cols-2">
              <p className="flex items-center gap-2.5 text-sm text-lightColor">
                <Truck className="h-4 w-4 shrink-0 text-shop_light_green" aria-hidden />
                {siteConfig.delivery.estimate}
              </p>
              <p className="flex items-center gap-2.5 text-sm text-lightColor">
                <ShieldCheck className="h-4 w-4 shrink-0 text-shop_light_green" aria-hidden />
                Genuine products, dispensed by licensed pharmacists
              </p>
            </div>

            <section aria-labelledby="product-information">
              <h2
                id="product-information"
                className="mb-3 text-base font-semibold text-darkColor"
              >
                Product Information
              </h2>
              <dl className="divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10">
                {productInformation
                  .filter((row) => row.value)
                  .map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-sm odd:bg-shop_light_bg/40"
                    >
                      <dt className="font-medium text-lightColor">
                        {row.label}
                      </dt>
                      <dd className="text-darkColor">{row.value}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          </div>
        </div>

        {product.longDescription &&
          sanitizeProductHtml(product.longDescription).replace(/<[^>]+>/g, "").trim() && (
            <section
              aria-labelledby="product-details"
              className="mt-12 border-t border-black/10 pt-10"
            >
              <h2
                id="product-details"
                className="mb-4 text-xl font-bold text-darkColor"
              >
                Product details
              </h2>
              <div
                className="product-prose max-w-3xl"
                dangerouslySetInnerHTML={{
                  __html: sanitizeProductHtml(product.longDescription),
                }}
              />
            </section>
          )}

        {relatedProducts.length > 0 && (
          <section aria-labelledby="related-products" className="mt-14">
            <h2
              id="related-products"
              className="mb-5 text-xl font-bold text-darkColor sm:text-2xl"
            >
              Related Products
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
};

export default ProductPage;
