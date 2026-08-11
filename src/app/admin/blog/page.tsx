import { DeleteAction } from "@/components/admin/DeleteAction";
import { Button } from "@/components/ui/Button";
import { adminBackendFetch } from "@/lib/admin-api";
import type { BlogPost } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await adminBackendFetch<BlogPost[]>("/api/admin/blog");
  } catch {
    posts = [];
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-brown-dark">Blog</h1>
          <p className="mt-1 text-brown-mid">{posts.length} posts</p>
        </div>
        <Link href="/admin/blog/new">
          <Button variant="gold">New post</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-brown-light bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-brown-light bg-cream/80 text-brown-mid">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brown-light/40">
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-brown-dark">{p.title}</td>
                <td className="px-4 py-3">{p.published ? "Published" : "Draft"}</td>
                <td className="px-4 py-3 text-brown-mid">
                  {p.publishedAt
                    ? format(new Date(p.publishedAt), "MMM d, yyyy")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/blog/${p.id}/edit`}
                      className="font-medium text-brown-dark hover:text-gold"
                    >
                      Edit
                    </Link>
                    <DeleteAction
                      endpoint={`/api/admin/blog/${p.id}`}
                      itemName={p.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
