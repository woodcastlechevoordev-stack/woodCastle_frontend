"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  size = 16,
  className,
  label = "Rating",
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  className?: string;
  label?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  const interactive = typeof onChange === "function";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${label}: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rounded >= star;
        const half = !filled && rounded >= star - 0.5;
        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              aria-checked={value === star}
              role="radio"
              onClick={() => onChange(star)}
              className="rounded p-0.5 text-gold transition-colors hover:text-brown-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Star
                size={size}
                className={value >= star ? "fill-gold text-gold" : "text-brown-light"}
              />
            </button>
          );
        }
        return (
          <Star
            key={star}
            size={size}
            className={
              filled
                ? "fill-gold text-gold"
                : half
                  ? "fill-gold/50 text-gold"
                  : "text-brown-light"
            }
            aria-hidden
          />
        );
      })}
    </div>
  );
}
