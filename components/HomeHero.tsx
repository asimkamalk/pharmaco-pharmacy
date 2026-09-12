"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { HeroSlideData } from "@/types/hero";

const HomeHeroCarousel = dynamic(() => import("@/components/HomeHeroCarousel"), {
  ssr: true,
  loading: () => null,
});

interface HomeHeroProps {
  slides: HeroSlideData[];
}

function HomeHeroStatic({ slide }: { slide: HeroSlideData }) {
  return (
    <section className="relative h-[min(88vh,52rem)] min-h-[26rem] w-full overflow-hidden bg-shop_dark_green sm:min-h-[30rem]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 hero-image-zoom">
          <Image
            src={slide.backgroundUrl}
            alt=""
            fill
            sizes="100vw"
            quality={75}
            preload
            className="object-cover object-center"
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20 sm:from-black/70 sm:via-black/40 sm:to-transparent"
      />

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="hero-copy-enter max-w-xl space-y-4 text-left sm:space-y-5 md:max-w-2xl">
            {slide.eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-shop_orange sm:text-xs">
                {slide.eyebrow}
              </p>
            )}
            <h1 className="font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {slide.headline}
            </h1>
            {slide.subcopy && (
              <p className="max-w-lg text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
                {slide.subcopy}
              </p>
            )}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              {slide.ctaLabel && (
                <Link
                  href={slide.ctaHref || "/shop"}
                  className="btn-cta h-12 px-8 text-[15px]"
                >
                  {slide.ctaLabel}
                </Link>
              )}
              {slide.ctaSecondaryLabel && (
                <Link
                  href={slide.ctaSecondaryHref || "/contact"}
                  className="btn-cta-secondary h-12 px-8 text-[15px]"
                >
                  {slide.ctaSecondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 pb-5 sm:px-6 lg:px-8">
          <ChevronDown className="h-5 w-5 animate-bounce text-white/70" />
        </div>
      </div>
    </section>
  );
}

const HomeHero = ({ slides }: HomeHeroProps) => {
  if (slides.length === 0) return null;
  if (slides.length === 1) return <HomeHeroStatic slide={slides[0]} />;
  return <HomeHeroCarousel slides={slides} />;
};

export default HomeHero;
