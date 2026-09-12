import type { NextConfig } from "next";
import path from "node:path";

const emptyPolyfill = path.join(__dirname, "lib/empty-polyfill.js");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
    // Inline CSS into HTML to remove render-blocking stylesheet requests (~LCP/FCP).
    inlineCss: true,
  },
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  // Next.js still injects a hard-coded polyfill module (flat/at/hasOwn/etc.).
  // Our audience is modern browsers, so replace it with an empty shim (~14KB save).
  turbopack: {
    resolveAlias: {
      "../build/polyfills/polyfill-module": "./lib/empty-polyfill.js",
      "next/dist/build/polyfills/polyfill-module": "./lib/empty-polyfill.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "../build/polyfills/polyfill-module": emptyPolyfill,
      "next/dist/build/polyfills/polyfill-module": emptyPolyfill,
    };
    return config;
  },
  images: {
    // Allow logo compression below the default 75 (Lighthouse image delivery).
    qualities: [50, 75],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
