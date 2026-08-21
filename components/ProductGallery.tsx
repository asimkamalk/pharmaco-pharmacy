"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-black/10 bg-shop_light_bg">
        <Image
          src={selectedImage}
          alt={productName}
          width={700}
          height={700}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="aspect-square w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image + index}
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`View image ${index + 1} of ${productName}`}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "overflow-hidden rounded-lg border-2 transition-colors duration-200",
                index === selectedIndex
                  ? "border-shop_light_green"
                  : "border-transparent hover:border-black/20",
              )}
            >
              <Image
                src={image}
                alt=""
                width={80}
                height={80}
                className="aspect-square w-16 object-cover sm:w-20"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
