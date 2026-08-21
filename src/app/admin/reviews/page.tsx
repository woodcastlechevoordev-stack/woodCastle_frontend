"use client";

import { DeleteAction } from "@/components/admin/DeleteAction";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/Button";
import type { Product, Review } from "@/lib/types";
import { queryString, unwrapList } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(unwrapList<Product>(data)))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const qs = queryString({
      search: debouncedSearch || undefined,
      productId: productId && productId !== "__none__" ? productId : undefined,
    });
    fetch(`/api/admin/reviews${qs}`)
      .then((r) => r.json())
      .then((data) => {
        const items = unwrapList<Review>(data);
        setReviews(
          items.filter((review) => {
            if (productId === "__none__" && review.productId) return false;
            if (
              productId &&
              productId !== "__none__" &&
              review.productId !== productId
            ) {
              return false;
            }
            if (debouncedSearch) {
              const q = debouncedSearch.toLowerCase();
              const hay = `${review.customerName} ${review.reviewText}`.toLowerCase();
              if (!hay.includes(q)) return false;
            }
            return true;
          })
        );
      })
      .catch(() => setReviews([]));
  }, [debouncedSearch, productId]);

  async function toggleActive(review: Review) {
    const res = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !review.isActive }),
    });
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    const nextActive =
      data && typeof data === "object" && "isActive" in data
        ? Boolean((data as Review).isActive)
        : !review.isActive;
    setReviews((prev) =>
      prev.map((item) =>
        item.id === review.id ? { ...item, isActive: nextActive } : item
      )
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-brown-dark">Reviews</h1>
          <p className="mt-1 text-brown-mid">{reviews.length} reviews</p>
        </div>
        <Link href="/admin/reviews/new">
          <Button variant="gold">New review</Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or review text…"
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-sm"
        />
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-xs"
        >
          <option value="">All products</option>
          <option value="__none__">Site-wide only</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brown-light bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-brown-light bg-cream/80 text-brown-mid">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brown-light/40">
            {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3 font-medium text-brown-dark">
                    {review.customerName}
                  </td>
                  <td className="px-4 py-3">
                    <StarRating value={review.rating} size={14} />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-brown-mid">
                    <span className="line-clamp-2">{review.reviewText}</span>
                  </td>
                  <td className="px-4 py-3 text-brown-mid">
                    {review.product?.name || "Site-wide"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(review)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                        review.isActive
                          ? "bg-gold-light text-brown-dark"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {review.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/reviews/${review.id}/edit`}
                        className="font-medium text-brown-dark hover:text-gold"
                      >
                        Edit
                      </Link>
                      <DeleteAction
                        endpoint={`/api/admin/reviews/${review.id}`}
                        itemName={`${review.customerName}'s review`}
                        onDeleted={() =>
                          setReviews((prev) =>
                            prev.filter((item) => item.id !== review.id)
                          )
                        }
                      />
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <p className="p-6 text-sm text-brown-mid">No reviews match these filters.</p>
        )}
      </div>
    </div>
  );
}
