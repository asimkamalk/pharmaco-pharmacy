"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/Container";
import ProductCarousel from "@/components/ProductCarousel";
import Reveal from "@/components/Reveal";
import { useIsHydrated } from "@/hooks";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import type { Product } from "@/types";

const RecentlyViewedSection = () => {
  const isHydrated = useIsHydrated();
  const ids = useRecentlyViewed((state) => state.ids);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (ids.length === 0) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const res = await fetch(
          `/api/products/by-ids?ids=${encodeURIComponent(ids.join(","))}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Failed to load");
        const data = (await res.json()) as { products: Product[] };
        if (!cancelled) setProducts(data.products ?? []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [ids, isHydrated]);

  if (!isHydrated || loading || products.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed">
      <Container className="py-14 sm:py-16">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="store-kicker">For you</p>
              <h2
                id="recently-viewed"
                className="store-heading mt-2 text-2xl sm:text-3xl"
              >
                Recently viewed
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-lightColor sm:text-[15px]">
                Pick up where you left off — up to 20 products from your browsing.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-shop_btn_dark_green transition-colors duration-200 hover:text-shop_leaf"
            >
              Continue shopping
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
        <Reveal>
          <ProductCarousel products={products} />
        </Reveal>
      </Container>
    </section>
  );
};

export default RecentlyViewedSection;
