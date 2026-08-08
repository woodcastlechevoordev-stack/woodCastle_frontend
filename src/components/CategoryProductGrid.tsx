"use client";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";
import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

function toNumber(price: Product["price"]): number | null {
  if (price == null) return null;
  const n = typeof price === "string" ? Number(price) : price;
  return Number.isNaN(n) ? null : n;
}

export function CategoryProductGrid({
  products,
  categoryId,
  categoryName,
}: {
  products: Product[];
  categoryId: string;
  categoryName: string;
}) {
  const prices = products
    .map((p) => toNumber(p.price))
    .filter((n): n is number => n != null);

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const [priceMax, setPriceMax] = useState(maxPrice || 0);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const n = toNumber(p.price);
      if (n == null) return true;
      if (!maxPrice) return true;
      return n <= priceMax;
    });
  }, [products, priceMax, maxPrice]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
      <aside className="mb-8 rounded-xl border border-brown-light/50 bg-white p-5 lg:mb-0 lg:self-start">
        <p className="text-sm font-semibold text-brown-dark">Filters</p>
        <div className="mt-5">
          <label htmlFor="price-range" className="text-xs font-medium uppercase tracking-wider text-brown-light">
            Max price
          </label>
          {prices.length === 0 ? (
            <p className="mt-2 text-sm text-brown-mid">Price on enquiry for all items.</p>
          ) : (
            <>
              <input
                id="price-range"
                type="range"
                min={minPrice}
                max={maxPrice}
                value={priceMax || maxPrice}
                onChange={(e) => {
                  setPriceMax(Number(e.target.value));
                  setVisible(PAGE_SIZE);
                }}
                className="mt-3 w-full accent-gold"
              />
              <p className="mt-2 text-sm text-brown-mid">
                Up to{" "}
                <span className="font-semibold text-brown-dark">
                  ₹{Math.round(priceMax || maxPrice).toLocaleString("en-IN")}
                </span>
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          className="mt-4 text-xs font-semibold text-gold hover:underline"
          onClick={() => {
            setPriceMax(maxPrice);
            setVisible(PAGE_SIZE);
          }}
        >
          Reset filters
        </button>
      </aside>

      <div>
        <p className="mb-6 text-sm text-brown-mid">
          Showing {shown.length} of {filtered.length} in {categoryName}
        </p>
        {filtered.length === 0 ? (
          <p className="text-brown-mid">No products match these filters.</p>
        ) : (
          <>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    categoryId,
                    category: p.category ?? {
                      id: categoryId,
                      name: categoryName,
                      slug: "",
                    },
                  }}
                />
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
    </div>
  );
}
