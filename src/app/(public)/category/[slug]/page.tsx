import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { getCategories, getCategoryWithProducts } from "@/lib/api";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryWithProducts(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.metaTitle || category.name,
    description: category.metaDescription || undefined,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: category.metaTitle || category.name,
      description: category.metaDescription || undefined,
      images: category.imageUrl ? [category.imageUrl] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryWithProducts(slug);
  if (!category) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: category.name, path: `/category/${slug}` },
        ])}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: category.name },
          ]}
        />
        <header className="mt-6 max-w-2xl">
          <p className="eyebrow">Collection</p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mt-4 text-brown-mid">{category.description}</p>
          )}
        </header>
        <div className="section-divider my-10" />
        {category.products.length === 0 ? (
          <p className="text-brown-mid">No products in this collection yet.</p>
        ) : (
          <CategoryProductGrid
            products={category.products}
            categoryId={category.id}
            categoryName={category.name}
          />
        )}
      </div>
    </>
  );
}
