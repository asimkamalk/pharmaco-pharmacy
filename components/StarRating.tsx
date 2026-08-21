import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

const StarRating = ({ rating, reviewCount, className }: StarRatingProps) => {
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-label={`Rated ${rating} out of 5${
        reviewCount !== undefined ? `, ${reviewCount} reviews` : ""
      }`}
    >
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              "h-3.5 w-3.5",
              index < Math.round(rating)
                ? "fill-shop_orange text-shop_orange"
                : "fill-none text-lightColor/40",
            )}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-lightColor">({reviewCount})</span>
      )}
    </div>
  );
};

export default StarRating;
