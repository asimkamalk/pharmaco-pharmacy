"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "fade" | "scale";

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delayMs?: number;
  /** Start visible immediately (e.g. first viewport content) */
  instant?: boolean;
  /** Render as another element (e.g. `li` inside `ol`/`ul`) */
  as?: "div" | "li";
}

const Reveal = ({
  children,
  className,
  variant = "up",
  delayMs = 0,
  instant = false,
  as = "div",
}: RevealProps) => {
  const Tag = as as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(instant);

  useEffect(() => {
    if (instant) return;
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [instant]);

  return (
    <Tag
      ref={ref}
      className={cn(
        "reveal",
        `reveal-${variant}`,
        visible && "reveal-visible",
        className,
      )}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
