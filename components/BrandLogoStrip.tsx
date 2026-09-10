"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { hasRealCatalogImage } from "@/lib/catalog-image";
import type { Brand } from "@/types";
import { cn } from "@/lib/utils";

interface BrandLogoStripProps {
  brands: Brand[];
  className?: string;
}

const AUTO_MS = 2800;

const BrandLogoStrip = ({ brands, className }: BrandLogoStripProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [paused, setPaused] = useState(false);

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

  useEffect(() => {
    if (!api || brands.length < 2 || paused) return;

    const timer = window.setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, AUTO_MS);

    return () => window.clearInterval(timer);
  }, [api, brands.length, paused]);

  if (brands.length === 0) return null;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          dragFree: true,
          containScroll: "trimSnaps",
        }}
        className="w-full md:px-10"
      >
        <CarouselContent className="-ml-2 cursor-grab items-center active:cursor-grabbing sm:-ml-4">
          {brands.map((brand) => {
            const hasLogo = hasRealCatalogImage(brand.image);
            return (
              <CarouselItem
                key={brand.id}
                className="basis-auto pl-2 sm:pl-4"
              >
                <Link
                  href={`/shop?brand=${brand.slug}`}
                  className="group flex h-16 w-[9.5rem] items-center justify-center rounded-xl bg-white px-4 transition duration-200 hover:bg-shop_mist/40 sm:h-[4.5rem] sm:w-[11rem]"
                  title={brand.title}
                >
                  {hasLogo ? (
                    <Image
                      src={brand.image}
                      alt={brand.title}
                      width={160}
                      height={64}
                      className="max-h-10 w-auto max-w-full object-contain opacity-80 transition duration-200 group-hover:opacity-100 sm:max-h-12"
                    />
                  ) : (
                    <span className="line-clamp-2 text-center text-xs font-semibold uppercase tracking-wide text-lightColor transition-colors duration-200 group-hover:text-shop_dark_green sm:text-[13px]">
                      {brand.title}
                    </span>
                  )}
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {canPrev ? (
        <button
          type="button"
          aria-label="Previous brands"
          onClick={() => api?.scrollPrev()}
          className="absolute left-0 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-shop_dark_green/15 bg-white text-shop_dark_green shadow-sm transition hover:bg-shop_mist md:inline-flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : null}

      {canNext ? (
        <button
          type="button"
          aria-label="Next brands"
          onClick={() => api?.scrollNext()}
          className="absolute right-0 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-shop_dark_green/15 bg-white text-shop_dark_green shadow-sm transition hover:bg-shop_mist md:inline-flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
};

export default BrandLogoStrip;
