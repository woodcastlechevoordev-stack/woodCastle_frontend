"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  image: string;
  eyebrow: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 6000);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const slide = slides[index];

  return (
    <section className="relative min-h-[78vh] overflow-hidden lg:min-h-[85vh]">
      {slides.map((s, i) => (
        <div
          key={`${s.headline}-${i}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-brown-dark/85 via-brown-dark/55 to-brown-dark/20" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:min-h-[85vh] lg:px-8">
        <p className="eyebrow text-gold-light">{slide.eyebrow}</p>
        <h1 className="mt-4 max-w-2xl font-heading text-4xl text-cream sm:text-5xl lg:text-6xl">
          {slide.headline}
        </h1>
        <p className="mt-5 max-w-lg text-lg text-cream/85">{slide.description}</p>
        <div className="mt-8">
          <Link href={slide.ctaHref}>
            <Button variant="gold" size="lg">
              {slide.ctaLabel}
            </Button>
          </Link>
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 bg-brown-dark/40 p-2 text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold sm:left-6 lg:inline-flex"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 bg-brown-dark/40 p-2 text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold sm:right-6 lg:inline-flex"
          >
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-8 bg-gold" : "w-2 bg-cream/50 hover:bg-cream"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
