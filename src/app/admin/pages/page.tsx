"use client";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { StaticPage } from "@/lib/types";
import { unwrapList } from "@/lib/utils";
import { staticPageFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof staticPageFormSchema>;

const PAGE_KEYS = [
  { key: "about", label: "About Us", path: "/about" },
  { key: "terms", label: "Terms & Conditions", path: "/terms-and-conditions" },
  { key: "contact", label: "Contact", path: "/contact" },
] as const;

function asPage(data: unknown): StaticPage | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.page && typeof obj.page === "object") return obj.page as StaticPage;
  if (typeof obj.key === "string" && typeof obj.title === "string") {
    return data as StaticPage;
  }
  return null;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const form = useForm<Values>({
    resolver: zodResolver(staticPageFormSchema),
    defaultValues: { title: "", content: "<p></p>" },
  });

  async function load() {
    const res = await fetch("/api/admin/pages");
    const data = await res.json().catch(() => []);
    setPages(unwrapList<StaticPage>(data));
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(
    () =>
      PAGE_KEYS.map((meta) => {
        const page = pages.find((p) => p.key === meta.key);
        return { ...meta, page };
      }),
    [pages]
  );

  function openEdit(key: string) {
    const page = pages.find((p) => p.key === key);
    const meta = PAGE_KEYS.find((p) => p.key === key);
    setMessage("");
    setEditingKey(key);
    form.reset({
      title: page?.title || meta?.label || "",
      content: page?.content || "<p></p>",
    });
  }

  async function onSubmit(values: Values) {
    if (!editingKey) return;
    setMessage("");
    const res = await fetch(`/api/admin/pages/${editingKey}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: values.title, content: values.content }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(
        typeof data.error === "string" ? data.error : "Failed to save page"
      );
      return;
    }
    const saved = asPage(data);
    setPages((prev) => {
      const next = prev.filter((p) => p.key !== editingKey);
      next.push(
        saved || {
          id: editingKey,
          key: editingKey,
          title: values.title,
          content: values.content,
        }
      );
      return next;
    });
    setEditingKey(null);
  }

  const editingMeta = PAGE_KEYS.find((p) => p.key === editingKey);

  return (
    <div>
      <h1 className="font-heading text-3xl text-brown-dark">Pages</h1>
      <p className="mt-1 text-brown-mid">
        Edit About, Terms &amp; Conditions, and Contact content
      </p>

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brown-light bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="font-heading text-xl text-brown-dark">{row.label}</h2>
              <p className="mt-1 text-sm text-brown-mid">
                {row.page?.title || "Not edited yet"}
                {row.page?.updatedAt
                  ? ` · Updated ${format(new Date(row.page.updatedAt), "MMM d, yyyy")}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={row.path}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brown-mid hover:text-gold"
              >
                View
              </a>
              <Button variant="outline" size="sm" onClick={() => openEdit(row.key)}>
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingKey && editingMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
            <h3 className="font-heading text-2xl text-brown-dark">
              Edit {editingMeta.label}
            </h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <Input id="page-title" label="Title" {...form.register("title")} />
              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RichTextEditor
                    id="page-content"
                    label="Content"
                    placeholder="Write page content…"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              {message && <p className="text-sm text-red-600">{message}</p>}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="gold"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Saving…" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingKey(null)}
                >
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
