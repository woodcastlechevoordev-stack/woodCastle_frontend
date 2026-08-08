import { BlogForm } from "@/components/admin/BlogForm";
import { adminBackendFetch } from "@/lib/admin-api";
import type { BlogPost } from "@/lib/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  let post: BlogPost | null = null;
  try {
    const posts = await adminBackendFetch<BlogPost[]>("/api/admin/blog");
    post = posts.find((p) => p.id === id) || null;
  } catch {
    post = null;
  }
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-8 font-heading text-3xl text-brown-dark">Edit blog post</h1>
      <BlogForm
        postId={post.id}
        published={post.published !== false}
        defaultValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.metaDescription || "",
          content: post.content,
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
        }}
      />
    </div>
  );
}
