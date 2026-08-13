import { SearchResults } from "@/components/SearchResults";
import { getCategories, getProducts } from "@/lib/api";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q?.trim()
    ? `Search results for “${q.trim()}” | Woodcastle`
    : "Search | Woodcastle";
  return {
    title,
    robots: { index: false, follow: true },
    alternates: { canonical: "/search" },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", category = "" } = await searchParams;
  const query = q.trim();
  const categorySlug = category.trim();

  const [categories, products] = await Promise.all([
    getCategories(),
    query || categorySlug
      ? getProducts({
          search: query || undefined,
          category: categorySlug || undefined,
          page: 1,
          limit: 48,
        })
      : Promise.resolve([]),
  ]);

  return (
    <SearchResults
      products={products}
      categories={categories}
      query={query}
      categorySlug={categorySlug}
    />
  );
}
