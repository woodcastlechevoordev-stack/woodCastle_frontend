"use client";

import { formatPrice } from "@/lib/api";
import { getTopLevelCategories, matchCategoriesByQuery } from "@/lib/categories";
import { FALLBACK_IMAGE, safeImageUrl } from "@/lib/images";
import type { Category, Product } from "@/lib/types";
import { unwrapList } from "@/lib/utils";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SearchOverlayProps = {
  categories: Category[];
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialCategory?: string;
  variant?: "overlay" | "inline";
};

export function buildSearchHref(query: string, categorySlug: string): string {
  const q = query.trim();
  if (!q && categorySlug) return `/category/${categorySlug}`;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (categorySlug) params.set("category", categorySlug);
  return `/search${params.toString() ? `?${params.toString()}` : ""}`;
}

export function SearchOverlay({
  categories,
  open,
  onClose,
  initialQuery = "",
  initialCategory = "",
  variant = "overlay",
}: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const mains = useMemo(() => getTopLevelCategories(categories), [categories]);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  const categoryMatches = useMemo(
    () => matchCategoriesByQuery(categories, query, 3),
    [categories, query]
  );

  useEffect(() => {
    setQuery(initialQuery);
    setCategory(initialCategory);
  }, [initialQuery, initialCategory]);

  useEffect(() => {
    if (variant === "overlay" && !open) {
      setSuggestionsOpen(false);
      setProducts([]);
      setLoading(false);
    }
  }, [open, variant]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setProducts([]);
      setLoading(false);
      setSuggestionsOpen(false);
      return;
    }

    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ search: q, limit: "5" });
        if (category) params.set("category", category);
        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setProducts(unwrapList<Product>(data));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [query, category]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSuggestionsOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function submitSearch() {
    router.push(buildSearchHref(query, category));
    setSuggestionsOpen(false);
    onClose();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submitSearch();
  }

  function onSelect() {
    setSuggestionsOpen(false);
    onClose();
  }

  const trimmed = query.trim();
  const showSuggestions = suggestionsOpen && trimmed.length > 0;
  const noMatches =
    !loading && products.length === 0 && categoryMatches.length === 0;

  const suggestions = (
    <div
      className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-brown-light/50 bg-white shadow-lg"
      role="listbox"
      aria-label="Search suggestions"
    >
      {loading && products.length === 0 && categoryMatches.length === 0 ? (
        <p className="px-4 py-3 text-sm text-brown-mid">Searching…</p>
      ) : noMatches ? (
        <p className="px-4 py-3 text-sm text-brown-mid">No matches yet</p>
      ) : (
        <>
          {categoryMatches.length > 0 && (
            <ul className="border-b border-brown-light/40 py-1">
              {categoryMatches.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onSelect}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-cream"
                  >
                    <span className="font-medium text-brown-dark">{cat.name}</span>
                    <span className="text-xs text-brown-light">
                      {cat.parent?.name || "Collection"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {products.length > 0 && (
            <ul className="py-1">
              {products.map((product) => {
                const thumb = safeImageUrl(product.images?.[0], FALLBACK_IMAGE);
                return (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onSelect}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream"
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-brown-light/40">
                        <Image
                          src={thumb}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-brown-dark">
                          {product.name}
                        </span>
                        <span className="text-xs font-semibold text-gold">
                          {formatPrice(product.price)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
      <button
        type="button"
        onClick={submitSearch}
        className="flex w-full items-center gap-2 border-t border-brown-light/40 px-4 py-2.5 text-left text-sm font-semibold text-gold hover:bg-cream"
      >
        <Search size={14} />
        View all results for &lsquo;{trimmed}&rsquo;
      </button>
    </div>
  );

  const form = (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="relative flex-1" ref={inputWrapRef}>
        <label htmlFor="site-search-q" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brown-light">
          Search
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brown-light"
          />
          <input
            id="site-search-q"
            autoFocus={variant === "overlay"}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setSuggestionsOpen(true);
            }}
            placeholder="Search furniture by name…"
            autoComplete="off"
            className="w-full rounded-lg border border-brown-light/60 bg-cream py-2.5 pl-9 pr-3 text-sm text-brown-dark outline-none focus:border-gold"
          />
        </div>
        {showSuggestions && suggestions}
      </div>
      <div className="sm:w-64">
        <label htmlFor="site-search-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brown-light">
          Category
        </label>
        <select
          id="site-search-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-brown-light/60 bg-cream px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold"
        >
          <option value="">All categories</option>
          {mains.map((main) =>
            (main.children?.length ?? 0) > 0 ? (
              <optgroup key={main.id} label={main.name}>
                <option value={main.slug}>All {main.name}</option>
                {main.children!.map((sub) => (
                  <option key={sub.id} value={sub.slug}>
                    {sub.name}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option key={main.id} value={main.slug}>
                {main.name}
              </option>
            )
          )}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-brown-dark px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-gold hover:text-brown-dark"
      >
        Search
      </button>
    </form>
  );

  if (variant === "inline") {
    return form;
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-cream p-4 sm:hidden">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-heading text-xl text-brown-dark">Search</p>
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="rounded-lg p-2 text-brown-dark hover:bg-brown-light/20"
          >
            <X size={22} />
          </button>
        </div>
        {form}
      </div>

      <div className="absolute inset-x-0 top-full z-50 hidden border-b border-brown-light/40 bg-white shadow-lg sm:block">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">{form}</div>
      </div>
    </>
  );
}
