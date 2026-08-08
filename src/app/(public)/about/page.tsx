import { getStaticPage } from "@/lib/api";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("about");
  return {
    title: page?.title || "About Us",
    description: "The Woodcastle story — craftsmanship, materials, and furniture built to last.",
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const page = await getStaticPage("about");

  return (
    <div>
      <section className="relative h-[45vh] min-h-[280px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1800&q=80"
          alt="Craftsperson working with wood"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brown-dark/60" />
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-12 sm:px-6 lg:px-8">
          <div>
            <p className="eyebrow text-gold-light">About Us</p>
            <h1 className="mt-3 font-heading text-4xl text-cream sm:text-5xl">
              {page?.title || "Crafted with intention"}
            </h1>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div
          className="space-y-4 text-lg text-brown-mid [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-brown-dark"
          dangerouslySetInnerHTML={{
            __html: page?.content
              ? page.content.includes("<")
                ? page.content
                : `<p>${page.content}</p>`
              : "<p>Woodcastle is a wood furniture studio dedicated to pieces that feel timeless.</p>",
          }}
        />
        <div className="mt-12">
          <Link href="/contact">
            <Button variant="gold">Visit or Contact Us</Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
