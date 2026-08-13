import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { excerptFromHtml, getBlogPostBySlug, getBlogPosts } from "@/lib/api";
import { articleJsonLd, JsonLd, publicPageMetadata } from "@/lib/seo";
import { format } from "date-fns";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Blog | Woodcastle" };
  return publicPageMetadata({
    metaTitle: post.metaTitle,
    name: post.title,
    description: post.metaDescription || excerptFromHtml(post.content),
    canonical: `/blog/${slug}`,
    images: post.coverImage,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const excerpt = excerptFromHtml(post.content);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          excerpt,
          coverImage: post.coverImage,
          publishedAt: post.publishedAt,
          slug: post.slug,
        })}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]}
        />
        <header className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {post.publishedAt ? (
              <time
                dateTime={post.publishedAt}
                className="text-xs font-medium uppercase tracking-wider text-brown-light"
              >
                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
              </time>
            ) : (
              <span />
            )}
            <ShareButton
              title={post.title}
              urlPath={`/blog/${slug}`}
              variant="label"
            />
          </div>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-brown-mid">{excerpt}</p>
        </header>
        {post.coverImage && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}
        <div
          className="prose-woodcastle mt-10 space-y-4 [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-brown-dark [&_p]:text-brown-mid"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
}
