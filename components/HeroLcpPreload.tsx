import { preload } from "react-dom";
import { getImageProps } from "next/image";

/** Must match HomeHero slide-0 Image props so the preload URL === LCP URL. */
const LCP_IMAGE = {
  alt: "",
  fill: true,
  sizes: "100vw",
  quality: 75,
} as const;

/** Emit a head preload with fetchpriority=high before the carousel hydrates. */
export default function HeroLcpPreload({ src }: { src: string }) {
  if (!src) return null;

  const {
    props: { src: href, srcSet, sizes },
  } = getImageProps({ ...LCP_IMAGE, src });

  preload(href, {
    as: "image",
    imageSrcSet: srcSet,
    imageSizes: sizes,
    fetchPriority: "high",
  });

  // Also render a real <link> so Lighthouse/preload scanner always see fetchpriority.
  // Omit href when imagesrcset is present (same as next/image).
  return (
    <link
      rel="preload"
      as="image"
      href={srcSet ? undefined : href}
      imageSrcSet={srcSet}
      imageSizes={sizes}
      fetchPriority="high"
    />
  );
}
