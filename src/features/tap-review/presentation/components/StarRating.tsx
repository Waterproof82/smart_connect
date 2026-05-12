import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-[var(--color-icon-amber)] text-[var(--color-icon-amber)]" : "text-[var(--color-text-muted)]"}`}
      />
    ))}
  </div>
);

export default StarRating;
