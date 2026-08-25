import { brand } from "./brand";
import { backendFetch } from "./backend";
import { findCategoryBySlug, nestCategories } from "./categories";
import { safeImageUrls } from "./images";
import { staticPageCacheTag } from "./static-pages";
import { queryString, stripHtml } from "./utils";
import type {
  BlogPost,
  Category,
  GoogleReviewsPayload,
  Offer,
  Product,
  Review,
  SiteInfo,
  StaticPage,
} from "./types";

export const REVALIDATE = 60;

export const siteInfo: SiteInfo = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Woodcastle",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || brand.tagline,
  phone: "+91 9074119382",
  email: "woodcastlechevoor@gmail.com",
  address: "Chevoor",
  city: "Thrissur, Kerala",
  postalCode: "680027",
  whatsapp: "919074119382",
  establishedYear: process.env.NEXT_PUBLIC_ESTABLISHED_YEAR || brand.establishedYear,
  mapsUrl: "https://maps.app.goo.gl/5v3tCVPo1BKsiqkYA",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Wood+Castle,+Chevoor,+Thrissur,+Kerala+680027&hl=en&z=16&output=embed",
};

const PRODUCTION_SITE_URL = "https://www.woodcastlefurniture.com";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export function formatPrice(amount: number | string | null | undefined): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (value == null || Number.isNaN(value)) return "Price on enquiry";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function productImages(product: Product): { url: string; alt: string }[] {
  return safeImageUrls(product.images).map((url, i) => ({
    url,
    alt: `${product.name} ${i + 1}`,
  }));
}

export function excerptFromHtml(html: string, max = 160): string {
  const text = stripHtml(html);
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

const revalidateOpt = { next: { revalidate: REVALIDATE } } as const;

export function unwrapItems<T>(data: T[] | { items?: T[] } | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.items) ? data.items : [];
}

export async function getCategories(): Promise<Category[]> {
  try {
    const flat = unwrapItems(
      await backendFetch<Category[] | { items: Category[] }>("/api/categories", revalidateOpt)
    );
    return nestCategories(flat);
  } catch {
    return [];
  }
}

export async function getCategoryWithProducts(slug: string): Promise<
  | (Category & {
      products: Product[];
      children: Category[];
      parent: Category["parent"];
    })
  | null
> {
  try {
    const [data, allCategories] = await Promise.all([
      backendFetch<
        | (Category & { products?: Product[]; items?: Product[] })
        | {
            category: Category;
            items?: Product[];
            products?: Product[];
          }
      >(`/api/categories/${slug}/products`, revalidateOpt),
      getCategories(),
    ]);

    if (!data || typeof data !== "object") return null;

    const fromTree = findCategoryBySlug(allCategories, slug);

    if ("category" in data && data.category) {
      return {
        ...data.category,
        parentId: fromTree?.parentId ?? data.category.parentId ?? null,
        parent: fromTree?.parent ?? data.category.parent ?? null,
        children: fromTree?.children ?? data.category.children ?? [],
        products: unwrapItems({ items: data.items ?? data.products }),
      };
    }

    const category = data as Category & { products?: Product[]; items?: Product[] };
    return {
      ...category,
      parentId: fromTree?.parentId ?? category.parentId ?? null,
      parent: fromTree?.parent ?? category.parent ?? null,
      children: fromTree?.children ?? category.children ?? [],
      products: unwrapItems({ items: category.items ?? category.products }),
    };
  } catch {
    return null;
  }
}

export async function getProducts(options?: {
  categorySlug?: string;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<Product[]> {
  try {
    const qs = new URLSearchParams();
    const category = options?.category || options?.categorySlug;
    if (options?.search) qs.set("search", options.search);
    if (category) {
      qs.set("category", category);
      qs.set("categorySlug", category);
    }
    if (options?.page) qs.set("page", String(options.page));
    if (options?.limit) qs.set("limit", String(options.limit));
    const query = qs.toString();
    return unwrapItems(
      await backendFetch<Product[] | { items: Product[] }>(
        `/api/products${query ? `?${query}` : ""}`,
        revalidateOpt
      )
    );
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await backendFetch<Product>(`/api/products/${slug}`, revalidateOpt);
  } catch {
    return null;
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    return unwrapItems(
      await backendFetch<BlogPost[] | { items: BlogPost[] }>("/api/blog", revalidateOpt)
    );
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    return await backendFetch<BlogPost>(`/api/blog/${slug}`, revalidateOpt);
  } catch {
    return null;
  }
}

export async function getActiveOffers(): Promise<Offer[]> {
  try {
    return unwrapItems(
      await backendFetch<Offer[] | { items: Offer[] }>("/api/offers", revalidateOpt)
    );
  } catch {
    return [];
  }
}

export async function getStaticPage(key: string): Promise<StaticPage | null> {
  try {
    const data = await backendFetch<StaticPage | { page?: StaticPage }>(
      `/api/pages/${key}`,
      { next: { revalidate: 60, tags: [staticPageCacheTag(key)] } }
    );
    if (!data || typeof data !== "object") return null;
    if ("page" in data && data.page && typeof data.page === "object") {
      return data.page;
    }
    if ("key" in data && "title" in data) return data as StaticPage;
    return null;
  } catch {
    return null;
  }
}

/** Active reviews. Omit productId for site-wide testimonials (spec §3.2.7). */
export async function getReviews(productId?: string): Promise<Review[]> {
  try {
    const qs = queryString({ productId });
    return unwrapItems(
      await backendFetch<Review[] | { items: Review[] }>(
        `/api/reviews${qs}`,
        revalidateOpt
      )
    ).filter((review) => {
      if (review.isActive === false) return false;
      if (productId) return review.productId === productId;
      return !review.productId;
    });
  } catch {
    return [];
  }
}

/** Google Places reviews via backend proxy (spec §3.2.7 / backend §5d). */
export async function getGoogleReviews(): Promise<GoogleReviewsPayload | null> {
  try {
    const data = await backendFetch<
      GoogleReviewsPayload & { userRatingCount?: number }
    >("/api/google-reviews", {
      next: { revalidate: 86400 },
    });
    const rating = Number(data?.rating);
    if (!data || Number.isNaN(rating)) return null;
    const reviews = Array.isArray(data.reviews) ? data.reviews.slice(0, 5) : [];
    return {
      rating,
      totalReviews: data.totalReviews ?? data.userRatingCount ?? reviews.length,
      reviews,
    };
  } catch {
    return null;
  }
}
