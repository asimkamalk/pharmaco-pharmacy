"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: Product[];
  className?: string;
}

const ProductCarousel = ({ products, className }: ProductCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback((instance: CarouselApi) => {
    if (!instance) return;
    setCanPrev(instance.canScrollPrev());
    setCanNext(instance.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    sync(api);
    api.on("reInit", sync);
    api.on("select", sync);
    return () => {
      api.off("reInit", sync);
      api.off("select", sync);
    };
  }, [api, sync]);

  if (products.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          dragFree: true,
          containScroll: "trimSnaps",
        }}
        className="w-full md:px-12"
      >
        <CarouselContent className="-ml-3 cursor-grab active:cursor-grabbing sm:-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-[78%] pl-3 sm:basis-1/2 sm:pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <div className="h-full select-none py-1">
                <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {canPrev ? (
        <button
          type="button"
          aria-label="Previous products"
          onClick={() => api?.scrollPrev()}
          className="absolute left-0 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-shop_dark_green/15 bg-white text-shop_dark_green shadow-md transition hover:bg-shop_mist md:inline-flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}

      {canNext ? (
        <button
          type="button"
          aria-label="Next products"
          onClick={() => api?.scrollNext()}
          className="absolute right-0 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-shop_dark_green/15 bg-white text-shop_dark_green shadow-md transition hover:bg-shop_mist md:inline-flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
};

export default ProductCarousel;
