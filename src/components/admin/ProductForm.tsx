"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { nestCategories } from "@/lib/categories";
import type { Category } from "@/lib/types";
import { productFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof productFormSchema>;

function categoryOptions(flat: Category[]): { id: string; label: string }[] {
  const tree = nestCategories(flat);
  const options: { id: string; label: string }[] = [];
  for (const main of tree) {
    if (main.children?.length) {
      for (const sub of main.children) {
        options.push({ id: sub.id, label: `${main.name} › ${sub.name}` });
      }
      options.push({ id: main.id, label: `${main.name} (all)` });
    } else {
      options.push({ id: main.id, label: main.name });
    }
  }
  // Fallback if nesting produced nothing useful
  if (options.length === 0) {
    return flat.map((c) => ({ id: c.id, label: c.name }));
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
  const [imageUrl, setImageUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
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
    () => categoryOptions(categories),
    [categories]
  );

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (!form.getValues("categoryId") && data[0]) {
            form.setValue("categoryId", data[0].id);
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

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  }

  function addImageUrl() {
    if (!imageUrl.trim()) return;
    setImages((prev) => [...prev, imageUrl.trim()]);
    setImageUrl("");
  }

  function moveImage(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  async function onSubmit(values: Values) {
    setMessage("");
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
            Category
          </label>
          <select
            id="categoryId"
            className="w-full rounded-lg border border-brown-light bg-white px-4 py-3 text-base text-brown-dark outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            {...form.register("categoryId")}
          >
            {categorySelectOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-brown-dark">
        <input type="checkbox" {...form.register("inStock")} className="accent-gold" />
        Active (visible on site)
      </label>

      <div>
        <p className="text-sm font-medium text-brown-dark">Images</p>
        <p className="mt-1 text-xs text-brown-light">
          Paste Cloudinary/Unsplash URLs (recommended), or drop local files for preview only.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
            className="flex-1 rounded-lg border border-brown-light px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <Button type="button" variant="outline" onClick={addImageUrl}>
            Add URL
          </Button>
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`mt-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver ? "border-gold bg-gold-light/20" : "border-brown-light bg-white"
          }`}
        >
          <label className="cursor-pointer text-sm font-semibold text-gold hover:underline">
            Browse local files
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>
        {images.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((url, i) => (
              <li key={url + i} className="relative overflow-hidden rounded-lg border border-brown-light">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-square w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-brown-dark/70 p-1">
                  <button
                    type="button"
                    className="flex-1 text-xs text-cream disabled:opacity-40"
                    disabled={i === 0}
                    onClick={() => moveImage(i, i - 1)}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="flex-1 text-xs text-cream"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    className="flex-1 text-xs text-cream disabled:opacity-40"
                    disabled={i === images.length - 1}
                    onClick={() => moveImage(i, i + 1)}
                  >
                    →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
