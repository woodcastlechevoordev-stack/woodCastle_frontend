"use client";

import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { blogFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your post…" }),
    ],
    content: defaultValues?.content || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      form.setValue("content", ed.getHTML(), { shouldValidate: true });
    },
    editorProps: {
      attributes: {
        class:
          "prose-woodcastle min-h-[220px] px-4 py-3 outline-none text-brown-dark [&_h2]:font-heading [&_h2]:text-xl",
      },
    },
  });

  useEffect(() => {
    if (editor && defaultValues?.content) {
      editor.commands.setContent(defaultValues.content);
    }
  }, [editor, defaultValues?.content]);

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

      <div>
        <p className="mb-1.5 text-sm font-medium text-brown-dark">Content</p>
        <div className="overflow-hidden rounded-lg border border-brown-light bg-white">
          <div className="flex flex-wrap gap-1 border-b border-brown-light bg-cream/60 px-2 py-1.5">
            {[
              { label: "Bold", action: () => editor?.chain().focus().toggleBold().run() },
              { label: "Italic", action: () => editor?.chain().focus().toggleItalic().run() },
              {
                label: "H2",
                action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
              },
              {
                label: "List",
                action: () => editor?.chain().focus().toggleBulletList().run(),
              },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.action}
                className="rounded px-2 py-1 text-xs font-medium text-brown-mid hover:bg-brown-light/30"
              >
                {btn.label}
              </button>
            ))}
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

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
