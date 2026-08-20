"use client";

import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { blogFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

type Values = z.infer<typeof blogFormSchema>;

export function BlogForm({
  defaultValues,
  postId,
  published = true,
}: {
  defaultValues?: Partial<Values>;
  postId?: string;
  published?: boolean;
}) {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState<string | null>(
    defaultValues?.coverImage || null
  );
  const [message, setMessage] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "<p></p>",
      coverImage: "",
      metaTitle: "",
      metaDescription: "",
      ...defaultValues,
    },
  });

  const metaTitle = form.watch("metaTitle");
  const metaDescription = form.watch("metaDescription");
  const slug = form.watch("slug");

  async function onSubmit(values: Values) {
    setMessage("");
    const payload = {
      title: values.title,
      slug: values.slug,
      content: values.content,
      coverImage: coverImage || null,
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription || values.excerpt,
      published,
    };
    const res = await fetch(
      postId ? `/api/admin/blog/${postId}` : "/api/admin/blog",
      {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Failed to save post");
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6">
      <Input id="blog-title" label="Title" {...form.register("title")} />
      <Input id="blog-slug" label="Slug" {...form.register("slug")} />
      <Textarea id="blog-excerpt" label="Excerpt (SEO fallback)" {...form.register("excerpt")} />

      <CloudinaryImageUpload
        mode="single"
        label="Cover image"
        helpText="Drag and drop to upload the post cover image directly to Cloudinary."
        folder="woodcastle/blog"
        value={coverImage}
        onChange={(url) => {
          setCoverImage(url);
          form.setValue("coverImage", url || "", { shouldValidate: true });
        }}
      />

      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => (
          <RichTextEditor
            id="blog-content"
            label="Content"
            placeholder="Write your post…"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="rounded-xl border border-brown-light bg-white p-5">
        <p className="eyebrow">SEO</p>
        <div className="mt-4 space-y-4">
          <Input id="blog-meta-title" label="Meta title" {...form.register("metaTitle")} />
          <Textarea
            id="blog-meta-desc"
            label="Meta description"
            {...form.register("metaDescription")}
          />
        </div>
        <div className="mt-6 rounded-lg border border-brown-light/60 bg-cream p-4">
          <p className="text-xs text-brown-light">Google preview</p>
          <p className="mt-2 truncate text-lg text-[#1a0dab]">
            {metaTitle || "Meta title will appear here"}
          </p>
          <p className="truncate text-sm text-[#006621]">
            woodcastle.in/blog/{slug || "slug"}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-[#545454]">
            {metaDescription || "Meta description will appear here."}
          </p>
        </div>
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}
      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save post"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
