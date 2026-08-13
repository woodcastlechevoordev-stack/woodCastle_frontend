"use client";

import { ProductCard } from "@/components/ProductCard";
import { SearchOverlay } from "@/components/SearchOverlay";
import { Button } from "@/components/ui/Button";
import type { Category, Product } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const PAGE_SIZE = 12;

export function SearchResults({
  products,
  categories,
  query,
  categorySlug,
}: {
  products: Product[];
  categories: Category[];
  query: string;
  categorySlug: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, categorySlug, products]);

  const shown = products.slice(0, visible);
  const hasMore = visible < products.length;
  const heading = query
    ? `Results for “${query}”`
    : categorySlug
      ? "Matching furniture"
      : "Search furniture";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <p className="eyebrow">Search</p>
      <h1 className="mt-3 font-heading text-3xl sm:text-4xl">{heading}</h1>
      <p className="mt-2 text-sm text-brown-mid">
        {products.length === 0
          ? "No products found"
          : `Showing ${shown.length} of ${products.length} product${products.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-8 rounded-xl border border-brown-light/50 bg-white p-4 shadow-sm sm:p-5">
        <SearchOverlay
          variant="inline"
          open
          onClose={() => undefined}
          categories={categories}
          initialQuery={query}
          initialCategory={categorySlug}
        />
      </div>

      {products.length === 0 ? (
        <div className="mt-12 rounded-xl border border-brown-light/50 bg-white p-8 text-center">
          <p className="font-heading text-2xl text-brown-dark">No products found</p>
          <p className="mt-2 text-brown-mid">
            Try a different name, or browse our collections instead.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-brown-dark px-5 py-2.5 text-sm font-semibold text-cream hover:bg-gold hover:text-brown-dark"
          >
            Browse collections
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
