"use client";

import { FALLBACK_IMAGE, safeImageUrl } from "@/lib/images";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function SignatureCollections({ categories }: { categories: Category[] }) {
  const items = categories.slice(0, 5);
  const [active, setActive] = useState(0);

  if (items.length === 0) return null;

  const current = items[active] ?? items[0];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">Signature Collections</p>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl">
            Discover our interior collections
          </h2>
          <div className="section-divider mt-6 max-w-xs" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <ol className="space-y-1">
            {items.map((category, i) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={cn(
                    "flex items-baseline gap-4 border-b border-brown-light/40 px-2 py-5 transition-colors",
                    i === active ? "text-gold" : "text-brown-dark hover:text-gold"
                  )}
                >
                  <span className="font-heading text-2xl tabular-nums opacity-50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-heading text-2xl sm:text-3xl">{category.name}</span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-brown-light/50 lg:min-h-full">
            <Image
              key={current.id}
              src={safeImageUrl(current.imageUrl, FALLBACK_IMAGE)}
              alt={current.name}
              fill
              className="object-cover transition-opacity duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/50 to-transparent" />
            <p className="absolute bottom-5 left-5 font-heading text-xl text-cream">
              {current.name}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
