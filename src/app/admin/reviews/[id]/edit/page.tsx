import { ReviewForm } from "@/components/admin/ReviewForm";
import { adminBackendFetch } from "@/lib/admin-api";
import type { Review } from "@/lib/types";
import { unwrapList } from "@/lib/utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditReviewPage({ params }: Props) {
  const { id } = await params;
  let review: Review | null = null;
  try {
    const data = await adminBackendFetch<Review[] | { items: Review[] }>(
      "/api/admin/reviews"
    );
    review = unwrapList<Review>(data).find((item) => item.id === id) || null;
  } catch {
    review = null;
  }
  if (!review) notFound();

  return (
    <div>
      <h1 className="mb-8 font-heading text-3xl text-brown-dark">Edit review</h1>
      <ReviewForm
        reviewId={review.id}
        defaultValues={{
          customerName: review.customerName,
          rating: review.rating,
          reviewText: review.reviewText,
          customerPhoto: review.customerPhoto || "",
          productId: review.productId || "",
          isActive: review.isActive !== false,
        }}
      />
    </div>
  );
}
