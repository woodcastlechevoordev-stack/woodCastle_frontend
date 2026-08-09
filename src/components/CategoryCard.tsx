import { FALLBACK_IMAGE, safeImageUrl } from "@/lib/images";
import type { Category } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
    >
      <Image
        src={safeImageUrl(category.imageUrl, FALLBACK_IMAGE)}
        alt={category.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/80 via-brown-dark/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-heading text-xl text-cream">{category.name}</h3>
      </div>
    </Link>
  );
}
