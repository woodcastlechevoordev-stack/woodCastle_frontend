import { getActiveOffers } from "@/lib/api";
import { FALLBACK_IMAGE, safeImageUrl } from "@/lib/images";
import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";

export const revalidate = 60;

export const metadata: Metadata = publicPageMetadata({
  name: "Offers & Promotions",
  description: "Current offers and seasonal promotions on Woodcastle furniture.",
  canonical: "/offers",
});

export default async function OffersPage() {
  const offers = await getActiveOffers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Promotions</p>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Current Offers</h1>
        <p className="mt-4 text-brown-mid">
          Limited-time promotions on selected collections. Enquire to claim — our team
          will confirm eligibility on WhatsApp.
        </p>
      </header>
      <div className="section-divider my-10" />

      {offers.length === 0 ? (
        <p className="text-brown-mid">No active offers right now. Check back soon.</p>
      ) : (
        <div className="space-y-10">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="overflow-hidden rounded-xl border border-brown-light bg-white shadow-sm"
            >
              <div className="grid lg:grid-cols-2">
                <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[280px]">
                  <Image
                    src={safeImageUrl(offer.bannerImage, FALLBACK_IMAGE)}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  {offer.discountText && (
                    <span className="w-fit rounded-md bg-gold-light px-2.5 py-1 text-xs font-semibold text-brown-dark">
                      {offer.discountText}
                    </span>
                  )}
                  <h2 className="mt-4 font-heading text-3xl">{offer.title}</h2>
                  {offer.description && (
                    <p className="mt-3 text-brown-mid">{offer.description}</p>
                  )}
                  {(offer.startsAt || offer.endsAt) && (
                    <p className="mt-4 text-sm text-brown-light">
                      {offer.startsAt && format(new Date(offer.startsAt), "MMM d")}
                      {offer.startsAt && offer.endsAt ? " – " : ""}
                      {offer.endsAt && format(new Date(offer.endsAt), "MMM d, yyyy")}
                    </p>
                  )}
                  <Link href={offer.linkUrl || "/contact"} className="mt-6">
                    <Button variant="gold">Enquire About This Offer</Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
