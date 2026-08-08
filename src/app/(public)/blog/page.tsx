import { excerptFromHtml, getBlogPosts, siteInfo } from "@/lib/api";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Care tips, timber guides, and stories from the Woodcastle studio.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Journal</p>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">From the studio</h1>
        <p className="mt-4 text-brown-mid">
          Practical guides and stories about living with solid wood furniture.
        </p>
      </header>
      <div className="section-divider my-10" />
      {posts.length === 0 ? (
        <p className="text-brown-mid">No posts published yet.</p>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-brown-light/40">
                  <Image
                    src={
                      post.coverImage ||
                      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brown-light">
                  <span className="rounded bg-gold-light/70 px-2 py-0.5 text-brown-dark">
                    Studio
                  </span>
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>
                      {format(new Date(post.publishedAt), "MMM d, yyyy")}
                    </time>
                  )}
                  <span aria-hidden>·</span>
                  <span>{siteInfo.name}</span>
                </div>
                <h2 className="mt-2 font-heading text-2xl text-brown-dark transition-colors group-hover:text-gold">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-brown-mid line-clamp-3">
                  {excerptFromHtml(post.content)}
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-gold">
                  Read More
                </span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
