"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { getTopLevelCategories, nestCategories } from "@/lib/categories";
import type { Category } from "@/lib/types";
import { categoryFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof categoryFormSchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState("");

  const form = useForm<Values>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "",
      metaTitle: "",
      metaDescription: "",
    },
  });

  const tree = useMemo(() => nestCategories(categories), [categories]);
  const mains = useMemo(() => getTopLevelCategories(tree), [tree]);
  const parentOptions = useMemo(
    () => mains.filter((c) => !editing || c.id !== editing.id),
    [mains, editing]
  );

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (Array.isArray(data)) setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setError("");
    form.reset({
      name: "",
      slug: "",
      description: "",
      parentId: "",
      metaTitle: "",
      metaDescription: "",
    });
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setError("");
    form.reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      parentId: cat.parentId || "",
      metaTitle: cat.metaTitle || "",
      metaDescription: cat.metaDescription || "",
    });
    setOpen(true);
  }

  async function onSubmit(values: Values) {
    setError("");
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      parentId: values.parentId ? values.parentId : null,
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
    };
    const res = await fetch(
      editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save");
      return;
    }
    setOpen(false);
    await load();
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
        <Button variant="gold" onClick={openCreate}>
          Add category
        </Button>
      </div>

      <div className="mt-8 space-y-6">
        {mains.map((main) => (
          <div
            key={main.id}
            className="rounded-xl border border-brown-light bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                  Main category
                </p>
                <h2 className="mt-1 font-heading text-xl text-brown-dark">{main.name}</h2>
                <p className="mt-1 text-sm text-brown-light">/{main.slug}</p>
                {main._count && (
                  <p className="mt-2 text-sm text-brown-mid">
                    {main._count.products} products
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => openEdit(main)}
                className="text-sm font-semibold text-gold hover:underline"
              >
                Edit
              </button>
            </div>

            {(main.children?.length ?? 0) > 0 && (
              <ul className="mt-4 grid gap-3 border-t border-brown-light/40 pt-4 sm:grid-cols-2">
                {main.children!.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg bg-cream/70 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-brown-dark">{sub.name}</p>
                      <p className="text-xs text-brown-light">/{sub.slug}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEdit(sub)}
                      className="text-xs font-semibold text-gold hover:underline"
                    >
                      Edit
                    </button>
                  </li>
                ))}
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
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="mt-4 text-sm font-semibold text-gold hover:underline"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h3 className="font-heading text-2xl text-brown-dark">
              {editing ? "Edit category" : "New category"}
            </h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <Input id="cat-name" label="Name" {...form.register("name")} />
              <Input id="cat-slug" label="Slug" {...form.register("slug")} />
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
                  {...form.register("parentId")}
                >
                  <option value="">None (main category)</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-brown-light">
                  Leave empty for one of the 11 main collections; pick a parent to create a
                  subcategory.
                </p>
              </div>
              <Input id="cat-meta-title" label="Meta title" {...form.register("metaTitle")} />
              <Textarea
                id="cat-meta-desc"
                label="Meta description"
                {...form.register("metaDescription")}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="gold">
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
