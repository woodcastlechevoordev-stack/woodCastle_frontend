"use client";

import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { DuplicateNameDialog } from "@/components/admin/DuplicateNameDialog";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { flattenCategories, getLeafCategories, subcategoryGroups } from "@/lib/categories";
import type { Category, DuplicateNameCheck } from "@/lib/types";
import {
  clearFormDraft,
  readFormDraft,
  slugify,
  stripProductCodeSuffix,
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

type DuplicatePrompt = {
  checkedName: string;
  baseName: string;
  categoryId: string;
  subcategoryName: string;
  suggestedName: string;
  suggestedSlug: string;
};

function duplicateCheckKey(name: string, categoryId: string) {
  return `${name.trim().toLowerCase()}|${categoryId}`;
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
  const restoredDraft = useRef(false);
  const skipDraftWrite = useRef(false);
  const dismissedDuplicates = useRef(new Set<string>());
  const originalName = (defaultValues?.name ?? "").trim();
  const originalCategoryId = defaultValues?.categoryId ?? "";
  const initialImages = defaultValues?.images ?? [];
  const [images, setImages] = useState<string[]>(initialImages);
  const [message, setMessage] = useState("");
  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicatePrompt | null>(null);
  const [keepNameNote, setKeepNameNote] = useState(false);

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

  useEffect(() => {
    const nameTrigger = values.name;
    const categoryIdTrigger = values.categoryId;
    if (!nameTrigger.trim() || !categoryIdTrigger) {
      setDuplicatePrompt(null);
      setKeepNameNote(false);
      return;
    }

    if (productId) {
      const nameChanged = nameTrigger.trim().toLowerCase() !== originalName.toLowerCase();
      const categoryChanged = categoryIdTrigger !== originalCategoryId;
      if (!nameChanged && !categoryChanged) {
        setDuplicatePrompt(null);
        return;
      }
    }

    if (dismissedDuplicates.current.has(duplicateCheckKey(nameTrigger, categoryIdTrigger))) {
      setDuplicatePrompt(null);
      return;
    }
    setKeepNameNote(false);

    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        // Always read the live field — never a name captured when the timer started.
        const currentName = form.getValues("name");
        const currentCategoryId = form.getValues("categoryId");
        if (!currentName.trim() || !currentCategoryId) {
          setDuplicatePrompt(null);
          return;
        }

        if (productId) {
          const nameChanged =
            currentName.trim().toLowerCase() !== originalName.toLowerCase();
          const categoryChanged = currentCategoryId !== originalCategoryId;
          if (!nameChanged && !categoryChanged) {
            setDuplicatePrompt(null);
            return;
          }
        }

        const key = duplicateCheckKey(currentName, currentCategoryId);
        if (dismissedDuplicates.current.has(key)) {
          setDuplicatePrompt(null);
          return;
        }

        const subcategoryName =
          flattenCategories(categories).find((c) => c.id === currentCategoryId)?.name ??
          "this subcategory";
        const params = new URLSearchParams({
          name: currentName,
          categoryId: currentCategoryId,
        });
        const res = await fetch(`/api/admin/products/check-duplicate-name?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as DuplicateNameCheck;
        if (!data.isDuplicate || !data.suggestedName) {
          setDuplicatePrompt(null);
          return;
        }
        if (data.suggestedName.trim() === currentName.trim()) {
          setDuplicatePrompt(null);
          return;
        }
        setDuplicatePrompt({
          checkedName: currentName,
          baseName:
            data.baseName ||
            stripProductCodeSuffix(data.suggestedName || currentName),
          categoryId: currentCategoryId,
          subcategoryName,
          suggestedName: data.suggestedName,
          suggestedSlug: data.suggestedSlug || slugify(data.suggestedName),
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }, 300);

    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [
    categories,
    form,
    originalCategoryId,
    originalName,
    productId,
    values.categoryId,
    values.name,
  ]);

  function applySuggestedName() {
    if (!duplicatePrompt) return;
    const { suggestedName, suggestedSlug } = duplicatePrompt;
    // Full replace — never append/concatenate onto the typed value
    // (that produced "Dining Chair DC-02 DC-2").
    form.setValue("name", suggestedName, { shouldValidate: true, shouldDirty: true });
    form.setValue("slug", suggestedSlug, { shouldValidate: true, shouldDirty: true });
    setDuplicatePrompt(null);
    setKeepNameNote(false);
  }

  function keepTypedName() {
    if (duplicatePrompt) {
      dismissedDuplicates.current.add(
        duplicateCheckKey(duplicatePrompt.checkedName, duplicatePrompt.categoryId)
      );
    }
    setDuplicatePrompt(null);
    setKeepNameNote(true);
  }

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
        <div>
          <Input
            id="name"
            label="Name"
            error={form.formState.errors.name?.message}
            {...form.register("name", { onBlur: onNameBlur })}
          />
          {keepNameNote && (
            <p className="mt-1.5 text-xs text-brown-mid" data-testid="keep-name-note">
              You kept this name. Saving may fail if another product in this subcategory
              already uses it — slugs must be unique.
            </p>
          )}
        </div>
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
        folder="products"
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
      <DuplicateNameDialog
        open={Boolean(duplicatePrompt)}
        baseName={duplicatePrompt?.baseName ?? ""}
        subcategoryName={
          flattenCategories(categories).find((c) => c.id === duplicatePrompt?.categoryId)
            ?.name ??
          duplicatePrompt?.subcategoryName ??
          ""
        }
        suggestedName={duplicatePrompt?.suggestedName ?? ""}
        onConfirm={applySuggestedName}
        onKeepName={keepTypedName}
      />
    </form>
  );
}
