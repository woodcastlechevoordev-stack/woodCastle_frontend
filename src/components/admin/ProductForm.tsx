"use client";

import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { getLeafCategories, nestCategories } from "@/lib/categories";
import type { Category } from "@/lib/types";
import { productFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof productFormSchema>;

function subcategoryOptions(flat: Category[]): { id: string; label: string }[] {
  const tree = nestCategories(flat);
  const options: { id: string; label: string }[] = [];
  for (const main of tree) {
    if (!main.children?.length) continue;
    for (const sub of main.children) {
      options.push({ id: sub.id, label: `${main.name} › ${sub.name}` });
    }
  }
  return options;
}

export function ProductForm({
  defaultValues,
  productId,
}: {
  defaultValues?: Partial<Values> & { images?: string[] };
  productId?: string;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>(defaultValues?.images ?? []);
  const [message, setMessage] = useState("");

  const form = useForm<Values>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      compareAtPrice: "",
      categoryId: "",
      featured: false,
      inStock: true,
      metaTitle: "",
      metaDescription: "",
      ...defaultValues,
    },
  });

  const categorySelectOptions = useMemo(
    () => subcategoryOptions(categories),
    [categories]
  );

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          const leaves = getLeafCategories(data);
          const current = form.getValues("categoryId");
          if (!current && leaves[0]) {
            form.setValue("categoryId", leaves[0].id);
          }
        }
      })
      .catch(() => undefined);
  }, [form]);

  function onNameBlur() {
    const name = form.getValues("name");
    if (!form.getValues("slug") && name) {
      form.setValue(
        "slug",
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
    if (!form.getValues("metaTitle") && name) {
      form.setValue("metaTitle", `${name} | Woodcastle`);
    }
  }

  async function onSubmit(values: Values) {
    setMessage("");
    const leafIds = new Set(getLeafCategories(categories).map((c) => c.id));
    if (!leafIds.has(values.categoryId)) {
      setMessage("Please assign this product to a subcategory (not a main category).");
      return;
    }
    if (images.length === 0) {
      setMessage("Please upload at least one product image.");
      return;
    }
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      price: Number(values.price),
      categoryId: values.categoryId,
      images,
      isActive: values.inStock,
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
    };

    const res = await fetch(
      productId ? `/api/admin/products/${productId}` : "/api/admin/products",
      {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Failed to save product");
      return;
    }
    setMessage("Product saved");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="name"
          label="Name"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
          onBlur={onNameBlur}
        />
        <Input
          id="slug"
          label="Slug"
          error={form.formState.errors.slug?.message}
          {...form.register("slug")}
        />
      </div>
      <Textarea
        id="description"
        label="Description"
        error={form.formState.errors.description?.message}
        {...form.register("description")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="price"
          label="Price (INR)"
          type="number"
          error={form.formState.errors.price?.message}
          {...form.register("price")}
        />
        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="block text-sm font-medium text-brown-dark">
            Subcategory
          </label>
          <select
            id="categoryId"
            className="w-full rounded-lg border border-brown-light bg-white px-4 py-3 text-base text-brown-dark outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            {...form.register("categoryId")}
          >
            {categorySelectOptions.length === 0 && (
              <option value="">No subcategories yet — create one first</option>
            )}
            {categorySelectOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-brown-light">
            Products must be assigned to a subcategory, not a main category.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-brown-dark">
        <input type="checkbox" {...form.register("inStock")} className="accent-gold" />
        Active (visible on site)
      </label>

      <CloudinaryImageUpload
        mode="multi"
        label="Images"
        helpText="Drag and drop to upload directly to Cloudinary. First image is the primary listing image."
        folder="woodcastle/products"
        value={images}
        onChange={setImages}
      />

      <div className="rounded-xl border border-brown-light bg-white p-5">
        <p className="eyebrow">SEO</p>
        <div className="mt-4 space-y-4">
          <Input id="metaTitle" label="Meta title" {...form.register("metaTitle")} />
          <Textarea
            id="metaDescription"
            label="Meta description"
            {...form.register("metaDescription")}
          />
        </div>
      </div>

      {message && <p className="text-sm text-brown-mid">{message}</p>}
      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
