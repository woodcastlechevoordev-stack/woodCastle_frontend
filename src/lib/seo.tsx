import { getSiteUrl, siteInfo } from "./api";
import type { Product } from "./types";
import type { Metadata } from "next";

/**
 * Admin-entered metaTitle is already the complete document title.
 * Only append "| Woodcastle" when metaTitle is blank.
 */
export function pageTitle(
  metaTitle: string | null | undefined,
  name: string
): string {
  const trimmed = metaTitle?.trim();
  if (trimmed) return trimmed;
  return `${name} | ${siteInfo.name}`;
}

export function publicPageMetadata({
  metaTitle,
  name,
  description,
  canonical,
  images,
  type = "website",
}: {
  metaTitle?: string | null;
  name: string;
  description?: string | null;
  canonical: string;
  images?: string[] | string | null;
  type?: "website" | "article";
}): Metadata {
  const title = pageTitle(metaTitle, name);
  const desc = description?.trim() || undefined;
  const imageList = !images
    ? undefined
    : (Array.isArray(images) ? images : [images]).filter(
        (url): url is string => Boolean(url)
      );

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      type,
      images: imageList,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: imageList,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteInfo.name,
    url: getSiteUrl(),
    description: siteInfo.tagline,
    telephone: siteInfo.phone,
    email: siteInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.address,
      addressLocality: siteInfo.city,
      addressCountry: "IN",
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    name: siteInfo.name,
    description: siteInfo.tagline,
    url: getSiteUrl(),
    telephone: siteInfo.phone,
    email: siteInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.address,
      addressLocality: siteInfo.city,
      addressCountry: "IN",
    },
    priceRange: "₹₹₹",
  };
}

export function productJsonLd(product: Product) {
  const price =
    typeof product.price === "string" ? Number(product.price) : product.price;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images || [],
    url: `${getSiteUrl()}/product/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: price ?? undefined,
      availability: "https://schema.org/InStock",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${getSiteUrl()}${item.path}`,
    })),
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt || undefined,
    url: `${getSiteUrl()}/blog/${post.slug}`,
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
