import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { formatPrice, getProductBySlug, getProducts } from "@/lib/api";
import { breadcrumbJsonLd, JsonLd, productJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || undefined,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || undefined,
      images: product.images,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = product.category;
  const related = category
    ? (await getProducts({ categorySlug: category.slug }))
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  const shortDescription =
    product.description.length > 220
      ? `${product.description.slice(0, 220).trim()}…`
      : product.description;

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          {
            name: category?.name ?? "Collection",
            path: `/category/${category?.slug ?? ""}`,
          },
          { name: product.name, path: `/product/${slug}` },
        ])}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            ...(category
              ? [{ label: category.name, href: `/category/${category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images || []} name={product.name} />

          <div>
            {category && <p className="eyebrow">{category.name}</p>}
            <h1 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4">
              <span className="text-2xl font-semibold text-gold">
                {formatPrice(product.price)}
              </span>
            </div>
            <p className="mt-6 text-brown-mid whitespace-pre-line">{shortDescription}</p>

            <div className="mt-8 scroll-mt-28" id="enquire">
              <EnquiryForm productId={product.id} productName={product.name} />
            </div>
          </div>
        </div>

        <section className="mt-14 border-t border-brown-light/40 pt-12">
          <p className="eyebrow">Details</p>
          <h2 className="mt-3 font-heading text-2xl sm:text-3xl">Full description</h2>
          <p className="mt-5 max-w-3xl text-brown-mid whitespace-pre-line">
            {product.description}
          </p>
        </section>

        {related.length > 0 && (
          <section className="mt-16 border-t border-brown-light/40 pt-14">
            <div className="mb-8 text-center">
              <p className="eyebrow">Related</p>
              <h2 className="mt-3 font-heading text-3xl">You may also like</h2>
              <div className="section-divider mx-auto mt-6 max-w-xs" />
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brown-light bg-cream p-3 lg:hidden">
        <a
          href="#enquire"
          className="flex w-full items-center justify-center rounded-lg bg-gold py-3.5 text-sm font-semibold text-brown-dark"
        >
          Enquire Now
        </a>
      </div>
    </>
  );
}
