import { StarRating } from "@/components/StarRating";
import type { Review } from "@/lib/types";
import { safeImageUrl } from "@/lib/images";

export function ReviewCard({ review }: { review: Review }) {
  const photo = review.customerPhoto
    ? safeImageUrl(review.customerPhoto, "")
    : "";

  return (
    <blockquote className="rounded-xl border border-brown-light/50 bg-white p-6 shadow-sm">
      <StarRating value={review.rating} />
      <p className="mt-4 text-brown-mid">&ldquo;{review.reviewText}&rdquo;</p>
      <footer className="mt-5 flex items-center gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-light font-semibold text-brown-dark">
            {review.customerName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <cite className="not-italic font-semibold text-brown-dark">
            {review.customerName}
          </cite>
          {review.product?.name && (
            <p className="text-xs text-brown-light">{review.product.name}</p>
          )}
        </div>
      </footer>
    </blockquote>
  );
}
