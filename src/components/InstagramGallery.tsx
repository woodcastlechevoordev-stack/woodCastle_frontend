import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";

export function InstagramGallery({ products }: { products: Product[] }) {
  const items = products
    .flatMap((p) =>
      (p.images?.length ? p.images.slice(0, 1) : [PLACEHOLDER]).map((image) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        image,
      }))
    )
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section className="pb-4 pt-8 lg:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">Gallery</p>
          <h2 className="mt-3 font-heading text-3xl">Pieces from the workshop</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.slug}`}
            className="group relative aspect-square overflow-hidden"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
            <div className="absolute inset-0 bg-brown-dark/0 transition-colors group-hover:bg-brown-dark/35" />
            <span className="absolute inset-x-3 bottom-3 translate-y-2 text-center text-xs font-medium text-cream opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
