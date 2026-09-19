import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { ReviewCard } from "@/components/ReviewCard";
import { RichContent } from "@/components/RichContent";
import { ProductEnquireDock } from "@/components/ProductEnquireDock";
import { ShareButton } from "@/components/ShareButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { excerptFromHtml, formatPrice, getProductBySlug, getProducts, getReviews, getSiteUrl } from "@/lib/api";
import {
  breadcrumbJsonLd,
  JsonLd,
  productJsonLd,
  publicPageMetadata,
} from "@/lib/seo";
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
  if (!product) return { title: "Product | Woodcastle" };
  return publicPageMetadata({
    metaTitle: product.metaTitle,
    name: product.name,
    description: product.metaDescription,
    canonical: `/product/${slug}`,
    images: product.images,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = product.category;
  const [relatedAll, reviews] = await Promise.all([
    category ? getProducts({ categorySlug: category.slug }) : Promise.resolve([]),
    getReviews(product.id),
  ]);
  const related = relatedAll.filter((p) => p.id !== product.id).slice(0, 4);

  const shortDescription = excerptFromHtml(product.description, 220);

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

      <div className="mx-auto max-w-7xl px-4 py-10 pb-28 sm:px-6 lg:px-8 lg:py-14">
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
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="min-w-0 text-2xl font-semibold text-gold">
                {formatPrice(product.price)}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${product.name} — ${getSiteUrl()}/product/${slug}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Share ${product.name} on WhatsApp`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brown-light/60 bg-white/95 text-[#25D366] shadow-sm transition-colors hover:border-gold hover:text-gold"
                >
                  <WhatsAppIcon size={16} />
                </a>
                <ShareButton
                  title={product.name}
                  urlPath={`/product/${slug}`}
                />
              </div>
            </div>
            <p className="mt-6 text-brown-mid">{shortDescription}</p>

            <div className="mt-8 scroll-mt-28 pb-6 lg:pb-0" id="enquire">
              <EnquiryForm productId={product.id} productName={product.name} />
            </div>
          </div>
        </div>

        <section className="mt-14 border-t border-brown-light/40 pt-12">
          <p className="eyebrow">Details</p>
          <h2 className="mt-3 font-heading text-2xl sm:text-3xl">Full Description</h2>
          <RichContent
            html={product.description}
            className="mt-5 max-w-3xl text-brown-mid"
          />
        </section>

        {reviews.length > 0 && (
          <section className="mt-14 border-t border-brown-light/40 pt-12">
            <p className="eyebrow">Reviews</p>
            <h2 className="mt-3 font-heading text-2xl sm:text-3xl">Customer Reviews</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16 border-t border-brown-light/40 pt-14">
            <div className="mb-8 text-center">
              <p className="eyebrow">Related</p>
              <h2 className="mt-3 font-heading text-3xl">You May Also Like</h2>
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

      <ProductEnquireDock />
    </>
  );
}
