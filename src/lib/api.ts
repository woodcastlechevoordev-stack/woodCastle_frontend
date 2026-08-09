import { brand } from "./brand";
import { backendFetch } from "./backend";
import { findCategoryBySlug, nestCategories } from "./categories";
import { safeImageUrls } from "./images";
import type {
  BlogPost,
  Category,
  Offer,
  Product,
  SiteInfo,
  StaticPage,
} from "./types";

export const REVALIDATE = 60;

export const siteInfo: SiteInfo = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Woodcastle",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || brand.tagline,
  phone: "+91 98765 43210",
  email: "hello@woodcastle.in",
  address: "Chevoor",
  city: "Thrissur, Kerala",
  whatsapp: "919876543210",
  establishedYear: process.env.NEXT_PUBLIC_ESTABLISHED_YEAR || brand.establishedYear,
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3926.2!2d76.214!3d10.452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDI3JzA3LjIiTiA3NsKwMTInNTAuNCJF!5e0!3m2!1sen!2sin!4v1",
};

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

const revalidateOpt = { next: { revalidate: REVALIDATE } } as const;

function unwrapItems<T>(data: T[] | { items?: T[] } | null | undefined): T[] {
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
}): Promise<Product[]> {
  try {
    const qs = options?.categorySlug
      ? `?categorySlug=${encodeURIComponent(options.categorySlug)}`
      : "";
    return unwrapItems(
      await backendFetch<Product[] | { items: Product[] }>(`/api/products${qs}`, revalidateOpt)
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
    return await backendFetch<StaticPage>(`/api/pages/${key}`, revalidateOpt);
  } catch {
    return null;
  }
}
