import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryCard } from "@/components/CategoryCard";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { getCategories, getCategoryWithProducts } from "@/lib/api";
import { flattenCategories } from "@/lib/categories";
import { breadcrumbJsonLd, JsonLd, publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return flattenCategories(categories).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryWithProducts(slug);
  if (!category) return { title: "Category | Woodcastle" };
  return publicPageMetadata({
    metaTitle: category.metaTitle,
    name: category.name,
    description: category.metaDescription,
    canonical: `/category/${slug}`,
    images: category.imageUrl,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryWithProducts(slug);
  if (!category) notFound();

  const isMainWithSubs =
    !category.parentId && (category.children?.length ?? 0) > 0;
  const children = category.children ?? [];

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    ...(category.parent
      ? [
          {
            name: category.parent.name,
            path: `/category/${category.parent.slug}`,
          },
        ]
      : []),
    { name: category.name, path: `/category/${slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            ...(category.parent
              ? [
                  {
                    label: category.parent.name,
                    href: `/category/${category.parent.slug}`,
                  },
                ]
              : []),
            { label: category.name },
          ]}
        />
        <header className="mt-6 max-w-2xl">
          <p className="eyebrow">
            {category.parent ? category.parent.name : "Collection"}
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mt-4 text-brown-mid">{category.description}</p>
          )}
        </header>

        {isMainWithSubs && (
          <section className="mt-10">
            <p className="eyebrow">Shop by type</p>
            <h2 className="mt-2 font-heading text-2xl text-brown-dark">
              Subcategories
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {children.map((child) => (
                <CategoryCard key={child.id} category={child} />
              ))}
            </div>
            <div className="section-divider my-10" />
          </section>
        )}

        {!isMainWithSubs && <div className="section-divider my-10" />}

        {category.products.length === 0 ? (
          <p className="text-brown-mid">
            {isMainWithSubs
              ? "Choose a subcategory above, or check back soon for new pieces."
              : "No products in this collection yet."}
          </p>
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
