import { getStaticPage, siteInfo } from "@/lib/api";
import { brand } from "@/lib/brand";
import { publicPageMetadata } from "@/lib/seo";
import { resolveStaticPageHtml } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const revalidate = 60;

const DEFAULT_ABOUT_HTML = `
<p>${siteInfo.name} began in ${brand.locationShort} as one of the first furniture shops in the area — a workshop built on teak, joinery, and trust.</p>
<p>For ${brand.yearsOfLegacy} years we have furnished Kerala homes with solid wood pieces meant to last generations. That legacy is why families return to us, and why more than ${brand.customersLabel.toLowerCase()} customers place their confidence in our craft.</p>
<h2>Our Story</h2>
<p>Since ${brand.establishedYear}, ${siteInfo.name} has grown from a neighbourhood workshop into a trusted furniture house for Kerala families. We still design, select timber, and finish pieces with the same care that started this business — honest materials, skilled hands, and furniture you can live with for decades.</p>
<h2>100% Teak Wood</h2>
<p>Every piece we build starts with ${brand.material.toLowerCase()}. Teak’s natural oils, strength, and warm grain make it the right timber for furniture that ages with dignity — not a veneer story, but the real wood through and through.</p>
<h2>Craftsmanship</h2>
<p>Our carpenters and finishers work with traditional joinery and modern precision. From sofas and beds to dining sets and storage, each piece is made to sit well in a Kerala home: climate-aware, proportioned, and built to be used every day.</p>
<h2>Visit Us In Chevoor, Thrissur</h2>
<p>${brand.originStory} Visit our showroom to see finishes, grains, and proportions in person — then enquire for pieces crafted to order for your home.</p>
`;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("about");
  return publicPageMetadata({
    metaTitle: page?.title,
    name: "About Us",
    description: `${brand.yearsOfLegacy} years of teak furniture from ${brand.locationFull} — ${brand.tagline}.`,
    canonical: "/about",
  });
}

export default async function AboutPage() {
  const page = await getStaticPage("about");

  return (
    <div>
      <section className="relative h-[45vh] min-h-[280px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1800&q=80"
          alt="Craftsperson working with teak wood"
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
              {page?.title || `${brand.yearsOfLegacy} Years Of Teak Craft`}
            </h1>
            <p className="mt-3 max-w-xl text-cream/85">
              {brand.tagline} · From {brand.locationFull}
            </p>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div
          className="prose-woodcastle space-y-4 text-lg text-brown-mid [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-brown-dark"
          dangerouslySetInnerHTML={{
            __html: resolveStaticPageHtml(page?.content, DEFAULT_ABOUT_HTML),
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
