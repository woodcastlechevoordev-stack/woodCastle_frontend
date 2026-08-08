"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Category } from "@/lib/types";
import { categoryFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
      metaTitle: "",
      metaDescription: "",
    },
  });

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
      description: "",
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
          <p className="mt-1 text-brown-mid">Manage collection groupings</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          Add category
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-brown-light bg-white p-5 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brown-dark">{c.name}</h2>
            <p className="mt-1 text-sm text-brown-light">/{c.slug}</p>
            {c._count && (
              <p className="mt-2 text-sm text-brown-mid">
                {c._count.products} products
              </p>
            )}
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

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h3 className="font-heading text-2xl text-brown-dark">
              {editing ? "Edit category" : "New category"}
            </h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <Input id="cat-name" label="Name" {...form.register("name")} />
              <Input id="cat-slug" label="Slug" {...form.register("slug")} />
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
