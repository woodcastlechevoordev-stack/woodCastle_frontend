import { TrustFeatures } from "@/components/TrustFeatures";
import { getCategories, siteInfo } from "@/lib/api";
import { Facebook, Instagram, Phone, Mail } from "lucide-react";
import Link from "next/link";

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="bg-brown-dark text-cream">
      <TrustFeatures variant="dark" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-2xl">{siteInfo.name}</p>
            <p className="mt-3 text-sm text-cream/70">{siteInfo.tagline}</p>
            <p className="mt-4 text-sm text-cream/60">
              Premium solid wood furniture, crafted to order for homes that last.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-lg border border-cream/20 p-2 text-cream/70 transition hover:border-gold hover:text-gold"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-lg border border-cream/20 p-2 text-cream/70 transition hover:border-gold hover:text-gold"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow text-gold-light">Information</p>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/about", label: "About Us" },
                { href: "/blog", label: "Blog" },
                { href: "/contact#store", label: "Store Location" },
                { href: "/offers", label: "Offers" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-cream/80 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {categories.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-cream/80 transition-colors hover:text-gold"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold-light">Customer Services</p>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/contact", label: "Contact Us" },
                { href: "/terms-and-conditions", label: "Terms & Conditions" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-cream/80 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold-light">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-cream/80">
              <li>{siteInfo.address}</li>
              <li>{siteInfo.city}</li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-gold" />
                <a href={`tel:${siteInfo.phone}`} className="hover:text-gold">
                  {siteInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-gold" />
                <a href={`mailto:${siteInfo.email}`} className="hover:text-gold">
                  {siteInfo.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${siteInfo.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-gold hover:underline"
                >
                  WhatsApp us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="section-divider mt-12 opacity-40" />
        <p className="mt-6 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} {siteInfo.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
