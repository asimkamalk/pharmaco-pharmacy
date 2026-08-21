"use client";

import { MapPin } from "lucide-react";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { cn } from "@/lib/utils";

interface GoogleMapProps {
  className?: string;
  title?: string;
  description?: string;
}

const GoogleMap = ({ className, title, description }: GoogleMapProps) => {
  const siteConfig = useSiteConfig();
  const mapTitle = title ?? "Find us in Hayatabad";
  const mapDescription =
    description ??
    `Visit ${siteConfig.name} in ${siteConfig.location.area}, ${siteConfig.location.city}.`;

  return (
    <section
      aria-labelledby="pharmacy-map"
      className={cn(
        "overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-2 border-b border-black/5 bg-gradient-to-r from-shop_light_pink to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="pharmacy-map"
            className="flex items-center gap-2 text-lg font-semibold text-darkColor"
          >
            <MapPin className="h-5 w-5 text-shop_light_green" aria-hidden />
            {mapTitle}
          </h2>
          <p className="mt-1 text-sm text-lightColor">{mapDescription}</p>
        </div>
        <a
          href={siteConfig.map.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-shop_dark_green/20 bg-white px-4 text-sm font-semibold text-shop_dark_green transition-colors duration-200 hover:border-shop_light_green hover:text-shop_light_green"
        >
          Open in Google Maps
        </a>
      </div>
      <div className="relative aspect-[16/9] w-full bg-shop_light_bg sm:aspect-[21/9]">
        <iframe
          title={`${siteConfig.name} location map`}
          src={siteConfig.map.embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="px-5 py-3 text-xs text-lightColor">
        {siteConfig.location.address} · {siteConfig.contact.openingHours}
      </p>
    </section>
  );
};

export default GoogleMap;
