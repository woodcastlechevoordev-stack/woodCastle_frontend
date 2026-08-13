"use client";

import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { DeleteAction } from "@/components/admin/DeleteAction";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { getTopLevelCategories, nestCategories } from "@/lib/categories";
import type { Category } from "@/lib/types";
import {
  clearFormDraft,
  readFormDraft,
  slugify,
  unwrapList,
  writeFormDraft,
} from "@/lib/utils";
import { categoryFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof categoryFormSchema>;

const CATEGORY_DRAFT_KEY = "woodcastle:admin-category-draft";

type CategoryDraft = {
  open: boolean;
  editingId: string | null;
  values: Values;
  imageUrl: string | null;
};

const emptyValues: Values = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  imageUrl: "",
  metaTitle: "",
  metaDescription: "",
};

function categoryBlockReason(cat: Category): string | null {
  const childCount = cat.children?.length ?? 0;
  const productCount = cat._count?.products ?? 0;
  if (childCount > 0 && productCount > 0) {
    return `This category still has ${childCount} subcategor${childCount === 1 ? "y" : "ies"} and ${productCount} product${productCount === 1 ? "" : "s"}. Reassign or remove them before deleting.`;
  }
  if (childCount > 0) {
    return `This category still has ${childCount} subcategor${childCount === 1 ? "y" : "ies"}. Reassign or remove them before deleting.`;
  }
  if (productCount > 0) {
    return `This category still has ${productCount} product${productCount === 1 ? "" : "s"}. Reassign or remove them before deleting.`;
  }
  return null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const form = useForm<Values>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyValues,
  });
  const values = form.watch();

  const tree = useMemo(() => nestCategories(categories), [categories]);
  const mains = useMemo(() => getTopLevelCategories(tree), [tree]);
  const parentOptions = useMemo(
    () => mains.filter((c) => !editing || c.id !== editing.id),
    [mains, editing]
  );

  async function load() {
    try {
      const qs = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      const res = await fetch(`/api/admin/categories${qs}`);
      const data = await res.json();
      const items = unwrapList<Category>(data);
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matched = items.filter((c) => c.name.toLowerCase().includes(q));
        const ids = new Set(matched.map((c) => c.id));
        for (const c of matched) {
          if (c.parentId) ids.add(c.parentId);
        }
        setCategories(items.filter((c) => ids.has(c.id)));
      } else {
        setCategories(items);
      }
    } catch {
      setError("Could not load categories. Try again.");
    }
  }

  const restoredDraft = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      load();
    }, search ? 300 : 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (!restoredDraft.current) {
      restoredDraft.current = true;
      const draft = readFormDraft<CategoryDraft>(CATEGORY_DRAFT_KEY);
      if (draft?.open) {
        setImageUrl(draft.imageUrl);
        form.reset(draft.values);
        setOpen(true);
      }
      return;
    }
    if (open) {
      writeFormDraft(CATEGORY_DRAFT_KEY, {
        open: true,
        editingId: editing?.id ?? null,
        values,
        imageUrl,
      } satisfies CategoryDraft);
    }
  }, [open, editing, values, imageUrl, form]);

  function openCreate() {
    setEditing(null);
    setError("");
    setImageUrl(null);
    form.reset(emptyValues);
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setError("");
    setImageUrl(cat.imageUrl);
    form.reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      parentId: cat.parentId || "",
      imageUrl: cat.imageUrl || "",
      metaTitle: cat.metaTitle || "",
      metaDescription: cat.metaDescription || "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setError("");
    clearFormDraft(CATEGORY_DRAFT_KEY);
  }

  function readParentIdFromDom(fallback?: string) {
    if (typeof document === "undefined") return fallback || "";
    const el = document.getElementById("cat-parent") as HTMLSelectElement | null;
    return (el?.value || fallback || "").trim();
  }

  useEffect(() => {
    if (!open) return;
    function syncFromDom() {
      const parent = document.getElementById("cat-parent") as HTMLSelectElement | null;
      if (parent) {
        form.setValue("parentId", parent.value, { shouldDirty: true });
      }
      const fields = {
        "cat-name": "name",
        "cat-slug": "slug",
        "cat-meta-title": "metaTitle",
        "cat-meta-desc": "metaDescription",
      } as const;
      for (const [id, name] of Object.entries(fields)) {
        const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
        if (el) form.setValue(name, el.value);
      }
    }
    document.addEventListener("visibilitychange", syncFromDom);
    window.addEventListener("pageshow", syncFromDom);
    window.addEventListener("focus", syncFromDom);
    return () => {
      document.removeEventListener("visibilitychange", syncFromDom);
      window.removeEventListener("pageshow", syncFromDom);
      window.removeEventListener("focus", syncFromDom);
    };
  }, [open, form]);

  function onNameBlur() {
    const name = form.getValues("name");
    if (!form.getValues("slug") && name) {
      form.setValue("slug", slugify(name), { shouldValidate: true });
    }
    if (!form.getValues("metaTitle") && name) {
      form.setValue("metaTitle", `${name} | Woodcastle`, { shouldValidate: true });
    }
  }

  async function onSubmit(formValues: Values) {
    setError("");
    const payload = {
      name: formValues.name,
      slug: formValues.slug,
      description: formValues.description || undefined,
      parentId: readParentIdFromDom(formValues.parentId) || null,
      imageUrl: imageUrl || null,
      metaTitle: formValues.metaTitle,
      metaDescription: formValues.metaDescription,
    };
    try {
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      clearFormDraft(CATEGORY_DRAFT_KEY);
      setOpen(false);
      form.reset(emptyValues);
      setImageUrl(null);
      setEditing(null);
      await load();
    } catch {
      setError("Could not save. Check your connection and try again.");
    }
  }

  function CategoryActions({ cat, size = "sm" }: { cat: Category; size?: "sm" | "xs" }) {
    const blockReason = categoryBlockReason(cat);
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => openEdit(cat)}
          className={
            size === "xs"
              ? "text-xs font-semibold text-gold hover:underline"
              : "text-sm font-semibold text-gold hover:underline"
          }
        >
          Edit
        </button>
        <DeleteAction
          endpoint={`/api/admin/categories/${cat.id}`}
          itemName={cat.name}
          blocked={Boolean(blockReason)}
          warning={blockReason || undefined}
          className={
            size === "xs"
              ? "text-xs font-semibold text-red-700 hover:underline"
              : "text-sm font-semibold text-red-700 hover:underline"
          }
          onDeleted={load}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-brown-dark">Categories</h1>
          <p className="mt-1 text-brown-mid">
            Manage the 11 main collections and their subcategories
          </p>
        </div>
        <Button variant="gold" onClick={openCreate} data-testid="add-category">
          Add category
        </Button>
      </div>

      <div className="mt-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-sm"
        />
      </div>

      <div className="mt-6 space-y-6">
        {mains.map((main) => (
          <div
            key={main.id}
            className="rounded-xl border border-brown-light bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 gap-4">
                {main.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={main.imageUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Main category
                  </p>
                  <h2 className="mt-1 font-heading text-xl text-brown-dark">{main.name}</h2>
                  <p className="mt-1 text-sm text-brown-light">/{main.slug}</p>
                  {main._count && (
                    <p className="mt-2 text-sm text-brown-mid">
                      {main._count.products} products
                      {(main.children?.length ?? 0) > 0
                        ? ` · ${main.children!.length} subcategories`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
              <CategoryActions cat={main} />
            </div>

            {(main.children?.length ?? 0) > 0 && (
              <ul className="mt-4 grid gap-3 border-t border-brown-light/40 pt-4 sm:grid-cols-2">
                {main.children!.map((sub) => {
                  // Prefer counts from the flat list when nesting dropped them
                  const full =
                    categories.find((c) => c.id === sub.id) || sub;
                  return (
                    <li
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg bg-cream/70 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-brown-dark">{full.name}</p>
                        <p className="text-xs text-brown-light">/{full.slug}</p>
                        {full._count && (
                          <p className="mt-0.5 text-xs text-brown-mid">
                            {full._count.products} products
                          </p>
                        )}
                      </div>
                      <CategoryActions cat={full} size="xs" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}

        {mains.length === 0 && categories.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-brown-light bg-white p-5 shadow-sm"
              >
                <h2 className="font-heading text-xl text-brown-dark">{c.name}</h2>
                <p className="mt-1 text-sm text-brown-light">/{c.slug}</p>
                <div className="mt-4">
                  <CategoryActions cat={c} />
                </div>
              </div>
            ))}
          </div>
        )}
        {mains.length === 0 && categories.length === 0 && (
          <p className="rounded-xl border border-brown-light bg-white p-6 text-sm text-brown-mid">
            No categories match this search.
          </p>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brown-dark/50 p-4"
          data-testid="category-modal"
        >
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="border-b border-brown-light/40 px-6 py-4">
              <h3 className="font-heading text-2xl text-brown-dark">
                {editing ? "Edit category" : "New category"}
              </h3>
            </div>
            <form
              onSubmit={form.handleSubmit(onSubmit, () => {
                setError("Please fix the highlighted fields, including meta title and description.");
              })}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="space-y-4 overflow-y-auto px-6 py-5">
                <Input
                  id="cat-name"
                  label="Name"
                  error={form.formState.errors.name?.message}
                  {...form.register("name", {
                    onBlur: onNameBlur,
                  })}
                />
                <Input
                  id="cat-slug"
                  label="Slug"
                  error={form.formState.errors.slug?.message}
                  {...form.register("slug")}
                />
                <div>
                  <label
                    htmlFor="cat-parent"
                    className="mb-1.5 block text-sm font-medium text-brown-dark"
                  >
                    Parent category
                  </label>
                  <select
                    id="cat-parent"
                    className="w-full rounded-lg border border-brown-light bg-cream px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold"
                    value={values.parentId || ""}
                    onChange={(e) =>
                      form.setValue("parentId", e.target.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                  >
                    <option value="">None (top-level category)</option>
                    {parentOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-brown-light">
                    Leave empty for a top-level collection; pick a parent to create a
                    subcategory.
                  </p>
                </div>
                <CloudinaryImageUpload
                  mode="single"
                  label="Category image"
                  helpText="Drag and drop to upload the category tile image directly to Cloudinary."
                  folder="woodcastle/categories"
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url);
                    form.setValue("imageUrl", url || "", { shouldValidate: true });
                  }}
                />
                <Input
                  id="cat-meta-title"
                  label="Meta title"
                  error={form.formState.errors.metaTitle?.message}
                  {...form.register("metaTitle")}
                />
                <Textarea
                  id="cat-meta-desc"
                  label="Meta description"
                  error={form.formState.errors.metaDescription?.message}
                  {...form.register("metaDescription")}
                />
                {error && (
                  <p className="text-sm text-red-600" data-testid="category-form-error">
                    {error}
                  </p>
                )}
              </div>
              <div className="flex gap-3 border-t border-brown-light/40 bg-white px-6 py-4">
                <Button
                  type="submit"
                  variant="gold"
                  disabled={form.formState.isSubmitting}
                  data-testid="category-save"
                >
                  {form.formState.isSubmitting ? "Saving…" : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
