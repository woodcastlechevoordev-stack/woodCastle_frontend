import { ContactForm } from "@/components/ContactForm";
import { siteInfo } from "@/lib/api";
import { JsonLd, localBusinessJsonLd, publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = publicPageMetadata({
  name: "Contact Us",
  description: `Visit Woodcastle in Chevoor, Thrissur — 44 years of teak furniture. Call ${siteInfo.phone} or send us a message.`,
  canonical: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl">We&apos;d love to hear from you</h1>
          <p className="mt-4 text-brown-mid">
            Visit our showroom, call us, or send a message — we typically respond within one business day.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="flex gap-4">
              <MapPin className="mt-1 shrink-0 text-gold" size={22} />
              <div>
                <h2 className="font-heading text-xl text-brown-dark">Showroom</h2>
                <p className="mt-1 text-brown-mid">
                  {siteInfo.address}
                  <br />
                  {siteInfo.city}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="mt-1 shrink-0 text-gold" size={22} />
              <div>
                <h2 className="font-heading text-xl text-brown-dark">Phone</h2>
                <a href={`tel:${siteInfo.phone}`} className="mt-1 block text-brown-mid hover:text-gold">
                  {siteInfo.phone}
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <Mail className="mt-1 shrink-0 text-gold" size={22} />
              <div>
                <h2 className="font-heading text-xl text-brown-dark">Email</h2>
                <a href={`mailto:${siteInfo.email}`} className="mt-1 block text-brown-mid hover:text-gold">
                  {siteInfo.email}
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-brown-light" id="store">
              <iframe
                title="Woodcastle location map"
                src={siteInfo.mapEmbedUrl}
                className="h-64 w-full border-0 grayscale-[30%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </>
  );
}
