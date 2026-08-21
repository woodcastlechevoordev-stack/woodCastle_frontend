import { ShareButton } from "@/components/ShareButton";
import { excerptFromHtml, getBlogPosts, siteInfo } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

export const revalidate = 60;

const PAGE_SIZE = 9;

type Props = { searchParams: Promise<{ page?: string }> };

export const metadata: Metadata = publicPageMetadata({
  name: "Blog",
  description:
    "Care tips, timber guides, and stories from the Woodcastle studio.",
  canonical: "/blog",
});

export default async function BlogPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const posts = await getBlogPosts();
  const requested = Math.max(1, Number.parseInt(page || "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const currentPage = Math.min(requested, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const shown = posts.slice(start, start + PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Journal</p>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">From The Studio</h1>
        <p className="mt-4 text-brown-mid">
          Practical guides and stories about living with solid wood furniture.
        </p>
      </header>
      <div className="section-divider my-10" />
      {posts.length === 0 ? (
        <p className="text-brown-mid">No posts published yet.</p>
      ) : (
        <>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((post) => (
              <article key={post.id} className="group">
                <div className="relative">
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
                  </Link>
                  <ShareButton
                    title={post.title}
                    urlPath={`/blog/${post.slug}`}
                    className="absolute right-3 top-3 z-10"
                  />
                </div>
                <Link href={`/blog/${post.slug}`} className="block">
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
          {totalPages > 1 && (
            <nav
              aria-label="Blog pagination"
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
            >
              {currentPage > 1 && (
                <Link
                  href={currentPage === 2 ? "/blog" : `/blog?page=${currentPage - 1}`}
                  className="rounded-lg border border-brown-light px-4 py-2 text-sm font-semibold text-brown-dark hover:border-gold"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={n === 1 ? "/blog" : `/blog?page=${n}`}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    n === currentPage
                      ? "bg-brown-dark text-gold"
                      : "border border-brown-light text-brown-dark hover:border-gold"
                  }`}
                >
                  {n}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="rounded-lg border border-brown-light px-4 py-2 text-sm font-semibold text-brown-dark hover:border-gold"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
