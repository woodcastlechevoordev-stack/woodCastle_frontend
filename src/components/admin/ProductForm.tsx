"use client";

import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { getLeafCategories, subcategoryGroups } from "@/lib/categories";
import type { Category } from "@/lib/types";
import {
  clearFormDraft,
  readFormDraft,
  slugify,
  unwrapList,
  writeFormDraft,
} from "@/lib/utils";
import { productFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof productFormSchema>;

const PRODUCT_DRAFT_KEY = "woodcastle:admin-product-draft";

type ProductDraft = {
  productId?: string;
  values: Values;
  images: string[];
};

export function ProductForm({
  defaultValues,
  productId,
}: {
  defaultValues?: Partial<Values> & { images?: string[] };
  productId?: string;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const restoredDraft = useRef(false);
  const skipDraftWrite = useRef(false);
  const initialImages = defaultValues?.images ?? [];
  const [images, setImages] = useState<string[]>(initialImages);
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
  const values = form.watch();

  const categoryGroups = useMemo(
    () => subcategoryGroups(categories),
    [categories]
  );

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        const items = unwrapList<Category>(data);
        setCategories(items);
        const leaves = getLeafCategories(items);
        const current = form.getValues("categoryId");
        if (!current && leaves[0]) {
          form.setValue("categoryId", leaves[0].id);
        }
      })
      .catch(() => undefined);
  }, [form]);

  useEffect(() => {
    if (!restoredDraft.current) {
      restoredDraft.current = true;
      const draft = readFormDraft<ProductDraft>(PRODUCT_DRAFT_KEY);
      // New-product drafts share productId: undefined, so a previous create
      // (or an unsaved visit) was being restored every time Add product opened.
      if (!productId) {
        if (draft && draft.productId == null) {
          clearFormDraft(PRODUCT_DRAFT_KEY);
        }
        return;
      }
      if (draft && draft.productId === productId) {
        form.reset(draft.values);
        setImages(draft.images);
      }
      return;
    }
    if (skipDraftWrite.current || !productId) return;
    writeFormDraft(PRODUCT_DRAFT_KEY, {
      productId,
      values,
      images,
    } satisfies ProductDraft);
  }, [form, images, productId, values]);

  function onNameBlur() {
    const name = form.getValues("name");
    if (!form.getValues("slug") && name) {
      form.setValue("slug", slugify(name), { shouldValidate: true });
    }
    if (!form.getValues("metaTitle") && name) {
      form.setValue("metaTitle", `${name} | Woodcastle`, { shouldValidate: true });
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
    skipDraftWrite.current = true;
    clearFormDraft(PRODUCT_DRAFT_KEY);
    setMessage("Product saved");
    router.push("/admin/products");
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, () => {
        setMessage("Please fix the highlighted fields, including meta title and description.");
      })}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="name"
          label="Name"
          error={form.formState.errors.name?.message}
          {...form.register("name", { onBlur: onNameBlur })}
        />
        <Input
          id="slug"
          label="Slug"
          error={form.formState.errors.slug?.message}
          {...form.register("slug")}
        />
      </div>
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <RichTextEditor
            id="description"
            label="Description"
            placeholder="Describe this piece — materials, dimensions, finish…"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
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
            {categoryGroups.length === 0 && (
              <option value="">No subcategories yet — create one first</option>
            )}
            {categoryGroups.map((group) => (
              <optgroup key={group.main} label={group.main}>
                {group.children.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="text-xs text-brown-light">
            Products must be assigned to a subcategory, not a main category.
          </p>
          {form.formState.errors.categoryId && (
            <p className="text-sm text-red-600">{form.formState.errors.categoryId.message}</p>
          )}
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
          <Input
            id="metaTitle"
            label="Meta title"
            error={form.formState.errors.metaTitle?.message}
            {...form.register("metaTitle")}
          />
          <Textarea
            id="metaDescription"
            label="Meta description"
            error={form.formState.errors.metaDescription?.message}
            {...form.register("metaDescription")}
          />
        </div>
      </div>

      {message && (
        <p className="text-sm text-brown-mid" data-testid="product-form-message">
          {message}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          type="submit"
          variant="gold"
          disabled={form.formState.isSubmitting}
          data-testid="product-save"
        >
          {form.formState.isSubmitting ? "Saving…" : "Save product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
