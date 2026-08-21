import { useEffect, useRef, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR/first client render and true after hydration.
 * Use it to safely render values from persisted client stores (cart,
 * wishlist) without hydration mismatches.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function useOutsideClick<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickedOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickedOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickedOutside);
    };
  }, [callback]);

  return ref;
}
