"use client";

import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Product } from "@/lib/types";
import { unwrapList } from "@/lib/utils";
import { reviewFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof reviewFormSchema>;

export function ReviewForm({
  defaultValues,
  reviewId,
}: {
  defaultValues?: Partial<Values>;
  reviewId?: string;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [photo, setPhoto] = useState<string | null>(
    defaultValues?.customerPhoto || null
  );
  const [message, setMessage] = useState("");

  const form = useForm<Values>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      customerName: "",
      rating: 5,
      reviewText: "",
      customerPhoto: "",
      productId: "",
      isActive: true,
      ...defaultValues,
    },
  });

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(unwrapList<Product>(data)))
      .catch(() => setProducts([]));
  }, []);

  async function onSubmit(values: Values) {
    setMessage("");
    const payload = {
      customerName: values.customerName,
      rating: values.rating,
      reviewText: values.reviewText,
      customerPhoto: photo || null,
      productId: values.productId || null,
      isActive: values.isActive,
    };
    const res = await fetch(
      reviewId ? `/api/admin/reviews/${reviewId}` : "/api/admin/reviews",
      {
        method: reviewId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(
        typeof data.error === "string" ? data.error : "Failed to save review"
      );
      return;
    }
    router.push("/admin/reviews");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
      <Input
        id="review-name"
        label="Customer name"
        {...form.register("customerName")}
        error={form.formState.errors.customerName?.message}
      />

      <Controller
        name="rating"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-1.5">
            <p className="block text-sm font-medium text-brown-dark">Star rating</p>
            <StarRating value={field.value} onChange={field.onChange} size={22} />
          </div>
        )}
      />

      <Textarea
        id="review-text"
        label="Review text"
        {...form.register("reviewText")}
        error={form.formState.errors.reviewText?.message}
      />

      <CloudinaryImageUpload
        mode="single"
        label="Customer photo (optional)"
        helpText="Drag and drop a photo, or leave empty for a name initial."
        folder="woodcastle/reviews"
        value={photo}
        onChange={(url) => {
          setPhoto(url);
          form.setValue("customerPhoto", url || "");
        }}
      />

      <div className="space-y-1.5">
        <label htmlFor="review-product" className="block text-sm font-medium text-brown-dark">
          Product (optional)
        </label>
        <select
          id="review-product"
          {...form.register("productId")}
          className="w-full rounded-lg border border-brown-light bg-white px-4 py-3 text-base text-brown-dark outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Site-wide testimonial (no product)</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-brown-light">
          Leave blank for a general homepage review. Choose a product to show it on that product page.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-brown-dark">
        <input type="checkbox" {...form.register("isActive")} className="accent-gold" />
        Active (visible on the public site)
      </label>

      {message && <p className="text-sm text-red-600">{message}</p>}
      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save review"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
