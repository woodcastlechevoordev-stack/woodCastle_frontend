import { ProductForm } from "@/components/admin/ProductForm";
import { adminBackendFetch } from "@/lib/admin-api";
import type { Product } from "@/lib/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  let product: Product | null = null;
  try {
    const products = await adminBackendFetch<Product[]>("/api/admin/products");
    product = products.find((p) => p.id === id) || null;
  } catch {
    product = null;
  }
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-8 font-heading text-3xl text-brown-dark">Edit product</h1>
      <ProductForm
        key={product.id}
        productId={product.id}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price ? Number(product.price) : 0,
          categoryId: product.categoryId,
          featured: false,
          inStock: product.isActive !== false,
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          images: product.images || [],
        }}
      />
    </div>
  );
}
