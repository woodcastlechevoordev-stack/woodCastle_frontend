import { excerptFromHtml, getSiteUrl, siteInfo } from "./api";
import { brand } from "./brand";
import { ogImageUrl, safeImageUrl } from "./images";
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
  const rawImages = !images
    ? []
    : (Array.isArray(images) ? images : [images]).filter(
        (url): url is string => Boolean(url)
      );
  const ogImages = rawImages
    .map((url) => ogImageUrl(url) || safeImageUrl(url, ""))
    .filter(Boolean)
    .map((url) => ({ url, width: 1200, height: 630 }));

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      type,
      images: ogImages.length ? ogImages : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ogImages.length ? ogImages.map((img) => img.url) : undefined,
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
    telephone: siteInfo.phone.replace(/\s/g, ""),
    email: siteInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.address,
      addressLocality: "Thrissur",
      addressRegion: "Kerala",
      postalCode: siteInfo.postalCode,
      addressCountry: "IN",
    },
    sameAs: [brand.instagramUrl, brand.facebookUrl],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    name: siteInfo.name,
    description: siteInfo.tagline,
    url: getSiteUrl(),
    telephone: siteInfo.phone.replace(/\s/g, ""),
    email: siteInfo.email,
    hasMap: siteInfo.mapsUrl,
    sameAs: [brand.instagramUrl, brand.facebookUrl],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.address,
      addressLocality: "Thrissur",
      addressRegion: "Kerala",
      postalCode: siteInfo.postalCode,
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
    description: excerptFromHtml(product.description, 300),
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
