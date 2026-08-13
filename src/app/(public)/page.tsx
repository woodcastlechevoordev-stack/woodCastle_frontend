import { CategoryCard } from "@/components/CategoryCard";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { InstagramGallery } from "@/components/InstagramGallery";
import { LookbookBanner } from "@/components/LookbookBanner";
import { ProductCard } from "@/components/ProductCard";
import { ShareButton } from "@/components/ShareButton";
import { SignatureCollections } from "@/components/SignatureCollections";
import { Testimonials } from "@/components/Testimonials";
import { TrustFeatures } from "@/components/TrustFeatures";
import {
  excerptFromHtml,
  getActiveOffers,
  getBlogPosts,
  getCategories,
  getProducts,
  siteInfo,
} from "@/lib/api";
import { brand } from "@/lib/brand";
import { getTopLevelCategories } from "@/lib/categories";
import { FALLBACK_IMAGE, safeImageUrl } from "@/lib/images";
import { JsonLd, organizationJsonLd } from "@/lib/seo";
import { format } from "date-fns";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FALLBACK_HERO = FALLBACK_IMAGE;

export default async function HomePage() {
  const [categories, products, offers, posts] = await Promise.all([
    getCategories(),
    getProducts(),
    getActiveOffers(),
    getBlogPosts(),
  ]);

  const topCategories = getTopLevelCategories(categories);
  const activeProducts = products.filter((p) => p.isActive !== false);
  const featured = activeProducts.slice(0, 8);
  const lookbookProducts = activeProducts.slice(0, 2);
  const galleryProducts = activeProducts.slice(0, 6);

  const heroSlides: HeroSlide[] = [
    {
      image: FALLBACK_HERO,
      eyebrow: siteInfo.name,
      headline: `${brand.yearsOfLegacy} Years of Legacy · ${brand.tagline}`,
      description: `${brand.material} furniture from ${brand.locationShort} — one of the first furniture shops in the area, trusted by ${brand.customersLabel.toLowerCase()} happy customers.`,
      ctaLabel: "Browse Collections",
      ctaHref: topCategories[0] ? `/category/${topCategories[0].slug}` : "/about",
    },
    ...(topCategories[0]
      ? [
          {
            image: safeImageUrl(topCategories[0].imageUrl, FALLBACK_HERO),
            eyebrow: siteInfo.name,
            headline: topCategories[0].name,
            description:
              topCategories[0].description ||
              "Explore thoughtfully crafted teak pieces for every room.",
            ctaLabel: `View ${topCategories[0].name}`,
            ctaHref: `/category/${topCategories[0].slug}`,
          },
        ]
      : []),
    ...(topCategories[1]
      ? [
          {
            image: safeImageUrl(
              topCategories[1].imageUrl,
              "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80"
            ),
            eyebrow: "Featured Collection",
            headline: topCategories[1].name,
            description:
              topCategories[1].description ||
              "Solid teak furniture crafted for Kerala homes.",
            ctaLabel: `View ${topCategories[1].name}`,
            ctaHref: `/category/${topCategories[1].slug}`,
          },
        ]
      : []),
    ...(offers[0]
      ? [
          {
            image: safeImageUrl(
              offers[0].bannerImage,
              "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=2000&q=80"
            ),
            eyebrow: offers[0].discountText || "Current Offer",
            headline: offers[0].title,
            description:
              offers[0].description || "Limited-time highlights from the workshop.",
            ctaLabel: "View Offers",
            ctaHref: offers[0].linkUrl || "/offers",
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      <HeroCarousel slides={heroSlides} />

      <TrustFeatures variant="light" />

      <section id="collections" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="eyebrow">Browse Categories</p>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl">Our collections</h2>
          <div className="section-divider mx-auto mt-6 max-w-xs" />
        </div>
        {topCategories.length === 0 ? (
          <p className="text-center text-brown-mid">
            Collections will appear here once added in the admin panel.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topCategories.slice(0, 6).map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="eyebrow">Featured Furniture</p>
            <h2 className="mt-3 font-heading text-3xl sm:text-4xl">Our picks for you</h2>
            <div className="section-divider mx-auto mt-6 max-w-xs" />
          </div>
          {featured.length === 0 ? (
            <p className="text-center text-brown-mid">
              Products will appear here once added in the admin panel.
            </p>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <LookbookBanner products={lookbookProducts} />

      {offers.length > 0 && (
        <section className="bg-cream py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Offers</p>
                <h2 className="mt-2 font-heading text-3xl">Seasonal highlights</h2>
              </div>
              <Link
                href="/offers"
                className="hidden text-sm font-semibold text-gold hover:underline sm:block"
              >
                View all offers
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {offers.map((offer) => (
                <Link
                  key={offer.id}
                  href={offer.linkUrl || "/offers"}
                  className="group relative min-w-[85%] snap-start overflow-hidden rounded-xl sm:min-w-[48%] lg:min-w-[32%]"
                >
                  <div className="relative aspect-[21/9] sm:aspect-[2.2/1]">
                    <Image
                      src={safeImageUrl(offer.bannerImage, FALLBACK_HERO)}
                      alt={offer.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 48vw, 32vw"
                    />
                    <div className="absolute inset-0 bg-brown-dark/55" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                      {offer.discountText && (
                        <span className="w-fit rounded-md bg-gold-light px-2.5 py-1 text-xs font-semibold text-brown-dark">
                          {offer.discountText}
                        </span>
                      )}
                      <h3 className="mt-2 font-heading text-xl text-cream sm:text-2xl">
                        {offer.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SignatureCollections categories={topCategories} />

      <Testimonials />

      {posts.length > 0 && (
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">News Insight</p>
                <h2 className="mt-3 font-heading text-3xl">From the journal</h2>
              </div>
              <Link
                href="/blog"
                className="hidden text-sm font-semibold text-gold hover:underline sm:block"
              >
                View all posts
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <article key={post.id} className="group">
                  <div className="relative">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                        <Image
                          src={
                            post.coverImage ||
                            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </Link>
                    <ShareButton
                      title={post.title}
                      urlPath={`/blog/${post.slug}`}
                      className="absolute right-3 top-3 z-10"
                    />
                  </div>
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brown-light">
                      <span className="text-gold">Studio</span>
                      {post.publishedAt && (
                        <>
                          <span aria-hidden>·</span>
                          <time dateTime={post.publishedAt}>
                            {format(new Date(post.publishedAt), "MMM d, yyyy")}
                          </time>
                        </>
                      )}
                    </div>
                    <h3 className="mt-2 font-heading text-xl text-brown-dark transition-colors group-hover:text-gold">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-brown-mid line-clamp-2">
                      {excerptFromHtml(post.content)}
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-gold">
                      Read More
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <InstagramGallery products={galleryProducts} />
    </>
  );
}
