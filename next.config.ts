import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sample product images are local SVG placeholders. Safe to serve with a
    // restrictive CSP; remove once real product photos replace them.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
