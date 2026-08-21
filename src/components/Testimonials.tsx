import { GoogleReviews } from "@/components/GoogleReviews";
import { ReviewCard } from "@/components/ReviewCard";
import type { GoogleReviewsPayload, Review } from "@/lib/types";

export function Testimonials({
  reviews,
  googleReviews,
}: {
  reviews: Review[];
  googleReviews: GoogleReviewsPayload | null;
}) {
  const hasReviews = reviews.length > 0;
  const hasGoogle = Boolean(googleReviews && (googleReviews.totalReviews > 0 || googleReviews.reviews.length > 0));

  if (!hasReviews && !hasGoogle) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 text-center">
        <p className="eyebrow">Testimonials</p>
        <h2 className="mt-3 font-heading text-3xl sm:text-4xl">Homes Furnished With Care</h2>
        <div className="section-divider mx-auto mt-6 max-w-xs" />
      </div>

      {hasReviews && (
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {hasGoogle && googleReviews && (
        <div className={hasReviews ? "mt-10" : undefined}>
          <GoogleReviews data={googleReviews} />
        </div>
      )}
    </section>
  );
}
