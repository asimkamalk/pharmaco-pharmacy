"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlideData } from "@/types/hero";
import { cn } from "@/lib/utils";

interface HomeHeroCarouselProps {
  slides: HeroSlideData[];
}

const AUTO_MS = 6500;

/** Multi-slide hero — Embla is isolated here so single-slide pages skip it. */
const HomeHeroCarousel = ({ slides }: HomeHeroCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    elapsedRef.current = 0;
    startedAtRef.current = Date.now();
    setProgressKey((key) => key + 1);
  }, [index]);

  useEffect(() => {
    if (!emblaApi || slides.length < 2) return;

    if (paused) {
      if (startedAtRef.current) {
        elapsedRef.current += Date.now() - startedAtRef.current;
        startedAtRef.current = 0;
      }
      return;
    }

    startedAtRef.current = Date.now();
    const remaining = Math.max(0, AUTO_MS - elapsedRef.current);
    const timer = window.setTimeout(() => {
      elapsedRef.current = 0;
      emblaApi.scrollNext();
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [emblaApi, slides.length, paused, index, progressKey]);

  return (
    <section
      className="relative h-[min(88vh,52rem)] min-h-[26rem] w-full overflow-hidden bg-shop_dark_green sm:min-h-[30rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-0",
                    slideIndex === index && "hero-image-zoom",
                  )}
                >
                  <Image
                    src={slide.backgroundUrl}
                    alt=""
                    fill
                    sizes="100vw"
                    quality={75}
                    preload={slideIndex === 0}
                    fetchPriority={slideIndex === 0 ? "high" : "low"}
                    loading={slideIndex === 0 ? undefined : "lazy"}
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
                  <div
                    key={`copy-${slide.id}-${slideIndex === index ? progressKey : "idle"}`}
                    className={cn(
                      "max-w-xl space-y-4 text-left sm:space-y-5 md:max-w-2xl",
                      slideIndex === index && "hero-copy-enter",
                    )}
                  >
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
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 sm:left-5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 sm:right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 pb-5 sm:px-6 lg:px-8">
          <ChevronDown className="h-5 w-5 animate-bounce text-white/70" />
          <div className="flex w-full gap-1.5">
            {slides.map((slide, slideIndex) => (
              <div
                key={slide.id}
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  key={
                    slideIndex === index
                      ? `active-${progressKey}`
                      : `seg-${slideIndex}-${index}`
                  }
                  className={cn(
                    "h-full origin-left rounded-full bg-shop_orange",
                    slideIndex < index && "w-full",
                    slideIndex > index && "w-0",
                    slideIndex === index && "hero-progress-fill",
                  )}
                  style={
                    slideIndex === index
                      ? {
                          animationDuration: `${AUTO_MS}ms`,
                          animationPlayState: paused ? "paused" : "running",
                        }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroCarousel;
