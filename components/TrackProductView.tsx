"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface TrackProductViewProps {
  productId: string;
}

/** Records a product page visit for the personalized home strip. */
const TrackProductView = ({ productId }: TrackProductViewProps) => {
  const trackView = useRecentlyViewed((state) => state.trackView);

  useEffect(() => {
    if (!productId) return;
    trackView(productId);
  }, [productId, trackView]);

  return null;
};

export default TrackProductView;
