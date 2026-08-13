"use client";

import { DeleteAction } from "@/components/admin/DeleteAction";
import { Button } from "@/components/ui/Button";
import type { BlogPost } from "@/lib/types";
import { queryString, unwrapList } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

type StatusFilter = "all" | "published" | "draft";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const published =
      status === "published" ? "true" : status === "draft" ? "false" : undefined;
    const qs = queryString({
      search: debouncedSearch || undefined,
      published,
    });
    fetch(`/api/admin/blog${qs}`)
      .then((r) => r.json())
      .then((data) => {
        const items = unwrapList<BlogPost>(data);
        setPosts(
          items.filter((p) => {
            if (status === "published" && !p.published) return false;
            if (status === "draft" && p.published) return false;
            if (debouncedSearch) {
              const q = debouncedSearch.toLowerCase();
              if (!p.title.toLowerCase().includes(q)) return false;
            }
            return true;
          })
        );
      })
      .catch(() => setPosts([]));
  }, [debouncedSearch, status]);

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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-[180px]"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brown-light bg-white shadow-sm">
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
                      onDeleted={() =>
                        setPosts((prev) => prev.filter((item) => item.id !== p.id))
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="p-6 text-sm text-brown-mid">No posts match these filters.</p>
        )}
      </div>
    </div>
  );
}
