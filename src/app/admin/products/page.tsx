import { adminBackendFetch } from "@/lib/admin-api";
import { formatPrice } from "@/lib/api";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: Product[] = [];
  try {
    products = await adminBackendFetch<Product[]>("/api/admin/products");
  } catch {
    products = [];
  }

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

      <div className="mt-8 overflow-x-auto rounded-xl border border-brown-light bg-white shadow-sm">
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
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="font-medium text-brown-dark hover:text-gold"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-6 text-sm text-brown-mid">No products yet. Add your first piece.</p>
        )}
      </div>
    </div>
  );
}
