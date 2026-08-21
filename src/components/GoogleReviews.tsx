import { StarRating } from "@/components/StarRating";
import { siteInfo } from "@/lib/api";
import type { GoogleReviewsPayload } from "@/lib/types";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleReviews({ data }: { data: GoogleReviewsPayload }) {
  const listingUrl = siteInfo.mapsUrl;

  return (
    <aside className="rounded-xl border border-brown-light/70 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-brown-dark">
            <GoogleMark className="h-5 w-5" />
            As Seen on Google
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="font-heading text-3xl text-brown-dark">
              {data.rating.toFixed(1)}
            </span>
            <div>
              <StarRating value={data.rating} />
              <p className="mt-1 text-xs text-brown-mid">
                {data.totalReviews.toLocaleString("en-IN")} Google reviews
              </p>
            </div>
          </div>
        </div>
        <a
          href={listingUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-gold hover:underline"
        >
          View on Google Maps
        </a>
      </div>

      {data.reviews.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.reviews.map((review, index) => (
            <li
              key={`${review.authorName}-${index}`}
              className="rounded-lg border border-brown-light/40 bg-cream/60 p-4"
            >
              <div className="flex items-center gap-3">
                {review.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.profilePhotoUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-brown-dark">
                    {review.authorName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brown-dark">
                    {review.authorName}
                  </p>
                  <p className="text-xs text-brown-light">
                    {review.relativeTimeDescription}
                  </p>
                </div>
              </div>
              <StarRating value={review.rating} size={14} className="mt-3" />
              {review.text && (
                <p className="mt-2 line-clamp-4 text-sm text-brown-mid">
                  {review.text}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-brown-light">
        Reviews shown here are from Google and may not represent all customer
        feedback.{" "}
        <a
          href={listingUrl}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-gold"
        >
          See the listing on Google
        </a>
        .
      </p>
    </aside>
  );
}
