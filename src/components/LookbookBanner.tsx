import { formatPrice } from "@/lib/api";
import { FALLBACK_IMAGE, safeImageUrl } from "@/lib/images";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export function LookbookBanner({ products }: { products: Product[] }) {
  const callouts = products.slice(0, 2);
  if (callouts.length === 0) return null;

  const hero = safeImageUrl(
    callouts[0]?.images?.[1] || callouts[0]?.images?.[0],
    FALLBACK_IMAGE
  );

  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[70vh] lg:min-h-[75vh]">
        <Image
          src={hero}
          alt="Woodcastle lookbook"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brown-dark/45" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 py-12 sm:px-6 lg:min-h-[75vh] lg:px-8 lg:py-16">
          <p className="eyebrow text-gold-light">Lookbook</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl text-cream sm:text-4xl">
            Lived-in spaces, lasting timber
          </h2>
          <p className="mt-3 max-w-md text-cream/80">
            Explore pieces styled for everyday living — tap a callout to view details.
          </p>

          <ul className="mt-8 flex flex-wrap gap-4">
            {callouts.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/product/${product.slug}`}
                  className="group flex max-w-xs items-center gap-3 rounded-xl border border-cream/25 bg-brown-dark/55 p-3 backdrop-blur-sm transition hover:border-gold"
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={safeImageUrl(product.images?.[0], FALLBACK_IMAGE)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </span>
                  <span>
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-gold-light">
                      Featured
                    </span>
                    <span className="mt-0.5 block font-heading text-sm text-cream group-hover:text-gold">
                      {product.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-cream/70">
                      {formatPrice(product.price)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
