"use client";

import { DeleteAction } from "@/components/admin/DeleteAction";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/api";
import { subcategoryGroups } from "@/lib/categories";
import type { Category, Product } from "@/lib/types";
import { queryString, stripHtml, unwrapList } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const groups = useMemo(() => subcategoryGroups(categories), [categories]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(unwrapList<Category>(data)))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const qs = queryString({
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
    });
    fetch(`/api/admin/products${qs}`)
      .then((r) => r.json())
      .then((data) => {
        const items = unwrapList<Product>(data);
        setProducts(
          items.filter((p) => {
            if (categoryId && p.categoryId !== categoryId && p.category?.id !== categoryId) {
              return false;
            }
            if (debouncedSearch) {
              const q = debouncedSearch.toLowerCase();
              const hay = `${p.name} ${stripHtml(p.description || "")}`.toLowerCase();
              if (!hay.includes(q)) return false;
            }
            return true;
          })
        );
      })
      .catch(() => setProducts([]));
  }, [debouncedSearch, categoryId]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-brown-dark">Products</h1>
          <p className="mt-1 text-brown-mid">{products.length} items in catalogue</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/import">
            <Button variant="outline">Import from Sheet</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button variant="gold">Add product</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or description…"
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-xs"
        >
          <option value="">All subcategories</option>
          {groups.map((group) => (
            <optgroup key={group.main} label={group.main}>
              {group.children.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brown-light bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-brown-light bg-cream/80 text-brown-mid">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brown-light/40">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cream/50">
                <td className="px-4 py-3 font-medium text-brown-dark">{p.name}</td>
                <td className="px-4 py-3 text-brown-mid">{p.category?.name || "—"}</td>
                <td className="px-4 py-3 font-semibold text-gold">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.isActive === false ? "No" : "Yes"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="font-medium text-brown-dark hover:text-gold"
                    >
                      Edit
                    </Link>
                    <DeleteAction
                      endpoint={`/api/admin/products/${p.id}`}
                      itemName={p.name}
                      onDeleted={() =>
                        setProducts((prev) => prev.filter((item) => item.id !== p.id))
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-6 text-sm text-brown-mid">No products match these filters.</p>
        )}
      </div>
    </div>
  );
}
