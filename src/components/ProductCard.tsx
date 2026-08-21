import { ShareButton } from "@/components/ShareButton";
import { formatPrice } from "@/lib/api";
import { FALLBACK_IMAGE, safeImageUrls } from "@/lib/images";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const images = safeImageUrls(product.images, FALLBACK_IMAGE);
  const primary = images[0];
  const secondary = images[1];
  const categoryName = product.category?.name;

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-brown-light/60 bg-white shadow-sm">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 block">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={
              secondary
                ? "object-cover transition-opacity duration-500 group-hover:opacity-0"
                : "object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            }
          />
          {secondary && (
            <Image
              src={secondary}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 opacity-100 transition-opacity duration-300 lg:pointer-events-auto lg:opacity-0 lg:group-hover:opacity-100">
          <Link
            href={`/product/${product.slug}#enquire`}
            className="pointer-events-auto flex w-full items-center justify-center rounded-lg bg-brown-dark py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-gold hover:text-brown-dark"
          >
            Enquire Now
          </Link>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        {categoryName && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brown-light">
            {categoryName}
          </p>
        )}
        <div className="flex items-start gap-2">
          <Link href={`/product/${product.slug}`} className="min-w-0 flex-1">
            <h3 className="font-heading text-lg text-brown-dark transition-colors group-hover:text-gold">
              {product.name}
            </h3>
          </Link>
          <ShareButton
            title={product.name}
            urlPath={`/product/${product.slug}`}
            className="mt-0.5 shrink-0"
          />
        </div>
        <p className="font-semibold text-gold">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
