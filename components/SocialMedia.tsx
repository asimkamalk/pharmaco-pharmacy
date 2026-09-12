"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/components/SiteConfigProvider";

interface Props {
  className?: string;
  iconClassName?: string;
  /** Kept for call-site compatibility; tooltips removed to cut unused JS. */
  tooltipClassName?: string;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.4V9.84c0-2.37 1.4-3.68 3.55-3.68 1.03 0 2.11.18 2.11.18v2.33h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.91h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.26 6.26 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.8a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52V6.8a4.84 4.84 0 0 1-1-.11z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SocialMedia = ({ className, iconClassName }: Props) => {
  const site = useSiteConfig();
  const socialLink = [
    {
      title: "Facebook",
      href: site.social.facebook,
      icon: <FacebookIcon className="h-5 w-5" />,
    },
    {
      title: "Instagram",
      href: site.social.instagram,
      icon: <InstagramIcon className="h-5 w-5" />,
    },
    {
      title: "TikTok",
      href: site.social.tiktok,
      icon: <TikTokIcon className="h-5 w-5" />,
    },
    {
      title: "Twitter",
      href: site.social.twitter,
      icon: <XIcon className="h-5 w-5" />,
    },
  ].filter((item) => item.href);

  if (socialLink.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      {socialLink.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.title}
          title={item.title}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 hover:border-shop_light_green hover:text-black",
            iconClassName,
          )}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
};

export default SocialMedia;
