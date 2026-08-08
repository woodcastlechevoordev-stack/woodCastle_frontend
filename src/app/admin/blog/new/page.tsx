import { BlogForm } from "@/components/admin/BlogForm";

export default function NewBlogPage() {
  return (
    <div>
      <h1 className="mb-8 font-heading text-3xl text-brown-dark">New blog post</h1>
      <BlogForm />
    </div>
  );
}
