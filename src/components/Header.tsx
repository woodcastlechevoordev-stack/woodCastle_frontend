"use client";

import { SearchOverlay } from "@/components/SearchOverlay";
import { SiteLogo } from "@/components/SiteLogo";
import { siteInfo } from "@/lib/api";
import { getTopLevelCategories } from "@/lib/categories";
import { FALLBACK_IMAGE, safeImageUrl } from "@/lib/images";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, MessageCircle, Phone, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const PLACEHOLDER = FALLBACK_IMAGE;

const utilityLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/contact#store", label: "Store Location" },
];

type HeaderProps = {
  categories: Category[];
};

export function Header({ categories }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeMainId, setActiveMainId] = useState<string | null>(null);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const mains = useMemo(() => getTopLevelCategories(categories), [categories]);

  const activeMain =
    mains.find((c) => c.id === activeMainId) ?? mains[0] ?? null;

  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
    setMobileExpandedId(null);
  }, [pathname]);

  useEffect(() => {
    if (megaOpen && mains[0] && !activeMainId) {
      setActiveMainId(mains[0].id);
    }
  }, [megaOpen, mains, activeMainId]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (megaRef.current && !megaRef.current.contains(target)) setMegaOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMegaOpen(false);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-brown-light/30 bg-brown-dark text-cream/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="hidden sm:block">
            Handcrafted Wood Furniture Since {siteInfo.establishedYear}
          </p>
          <a
            href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-gold"
          >
            <Phone size={12} />
            {siteInfo.phone}
          </a>
          <nav className="hidden items-center gap-5 sm:flex">
            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div
        className="relative border-b border-brown-light/40 bg-cream/95 backdrop-blur-sm"
        ref={searchRef}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[5.25rem] lg:px-8">
          <SiteLogo variant="header" priority />

          <nav className="hidden items-center gap-7 lg:flex">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-gold",
                pathname === "/" ? "text-gold" : "text-brown-mid"
              )}
            >
              Home
            </Link>

            <div
              className="relative"
              ref={megaRef}
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold",
                  pathname.startsWith("/category") || megaOpen
                    ? "text-gold"
                    : "text-brown-mid"
                )}
                aria-expanded={megaOpen}
                onClick={() => setMegaOpen((v) => !v)}
              >
                Collections
                <ChevronDown
                  size={14}
                  className={cn("transition-transform", megaOpen && "rotate-180")}
                />
              </button>

              {megaOpen && (
                <div className="absolute left-1/2 top-full z-50 w-[min(920px,88vw)] -translate-x-1/2 pt-3">
                  <div className="overflow-hidden rounded-xl border border-brown-light/50 bg-white shadow-lg">
                    {mains.length === 0 ? (
                      <p className="p-5 text-sm text-brown-mid">Collections coming soon.</p>
                    ) : (
                      <div className="grid min-h-[280px] grid-cols-[240px_1fr]">
                        <ul className="border-r border-brown-light/40 bg-cream/60 py-3">
                          {mains.map((main) => (
                            <li key={main.id}>
                              <button
                                type="button"
                                onMouseEnter={() => setActiveMainId(main.id)}
                                onFocus={() => setActiveMainId(main.id)}
                                onClick={() => setActiveMainId(main.id)}
                                className={cn(
                                  "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors",
                                  activeMain?.id === main.id
                                    ? "bg-white font-semibold text-gold"
                                    : "text-brown-dark hover:bg-white/80 hover:text-gold"
                                )}
                              >
                                {main.name}
                                {(main.children?.length ?? 0) > 0 && (
                                  <ChevronDown
                                    size={14}
                                    className="-rotate-90 opacity-50"
                                  />
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>

                        <div className="p-5">
                          {activeMain && (
                            <>
                              <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                  <p className="eyebrow">Collection</p>
                                  <Link
                                    href={`/category/${activeMain.slug}`}
                                    className="mt-1 font-heading text-xl text-brown-dark hover:text-gold"
                                  >
                                    {activeMain.name}
                                  </Link>
                                </div>
                                <Link
                                  href={`/category/${activeMain.slug}`}
                                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-brown-light/40"
                                >
                                  <Image
                                    src={safeImageUrl(activeMain.imageUrl, PLACEHOLDER)}
                                    alt={activeMain.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </Link>
                              </div>

                              {(activeMain.children?.length ?? 0) > 0 ? (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                  {activeMain.children!.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={`/category/${sub.slug}`}
                                      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-cream"
                                    >
                                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-brown-light/40">
                                        <Image
                                          src={safeImageUrl(
                                            sub.imageUrl || activeMain.imageUrl,
                                            PLACEHOLDER
                                          )}
                                          alt={sub.name}
                                          fill
                                          className="object-cover"
                                          sizes="48px"
                                        />
                                      </span>
                                      <span className="text-sm font-medium text-brown-dark group-hover:text-gold">
                                        {sub.name}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <Link
                                  href={`/category/${activeMain.slug}`}
                                  className="inline-flex text-sm font-semibold text-gold hover:underline"
                                >
                                  View All In {activeMain.name}
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {[
              { href: "/offers", label: "Offers" },
              { href: "/about", label: "About" },
              { href: "/blog", label: "Blog" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-gold",
                  pathname.startsWith(link.href) ? "text-gold" : "text-brown-mid"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search products"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className="rounded-lg p-2 text-brown-dark transition-colors hover:bg-brown-light/20 hover:text-gold"
            >
              <Search size={20} />
            </button>

            <Link
              href="/contact"
              className="hidden items-center gap-2 rounded-lg bg-brown-dark px-3.5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-gold hover:text-brown-dark sm:inline-flex"
            >
              <MessageCircle size={16} />
              Enquire Now
            </Link>

            <button
              type="button"
              className="rounded-lg p-2 text-brown-dark lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <SearchOverlay
          categories={categories}
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        {open && (
          <nav className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-brown-light/40 bg-cream px-4 py-4 lg:hidden">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-brown-mid hover:bg-brown-light/20"
                >
                  Home
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCollectionsOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-brown-mid hover:bg-brown-light/20"
                >
                  Collections
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform", collectionsOpen && "rotate-180")}
                  />
                </button>
                {collectionsOpen && (
                  <ul className="mb-2 ml-2 space-y-1 border-l border-brown-light/50 pl-2">
                    {mains.map((main) => (
                      <li key={main.id}>
                        <div className="flex items-center">
                          <Link
                            href={`/category/${main.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex flex-1 items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-brown-mid hover:bg-brown-light/20"
                          >
                            <span className="relative h-10 w-10 overflow-hidden rounded-md">
                              <Image
                                src={safeImageUrl(main.imageUrl, PLACEHOLDER)}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </span>
                            {main.name}
                          </Link>
                          {(main.children?.length ?? 0) > 0 && (
                            <button
                              type="button"
                              aria-label={`Expand ${main.name}`}
                              onClick={() =>
                                setMobileExpandedId((id) =>
                                  id === main.id ? null : main.id
                                )
                              }
                              className="rounded-lg p-2 text-brown-mid"
                            >
                              <ChevronDown
                                size={16}
                                className={cn(
                                  "transition-transform",
                                  mobileExpandedId === main.id && "rotate-180"
                                )}
                              />
                            </button>
                          )}
                        </div>
                        {mobileExpandedId === main.id &&
                          (main.children?.length ?? 0) > 0 && (
                            <ul className="ml-4 space-y-1 border-l border-brown-light/40 pl-3">
                              {main.children!.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={`/category/${sub.slug}`}
                                    onClick={() => setOpen(false)}
                                    className="block rounded-lg px-2 py-2 text-sm text-brown-mid hover:bg-brown-light/20"
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              {[
                { href: "/offers", label: "Offers" },
                { href: "/about", label: "About" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-brown-mid hover:bg-brown-light/20"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brown-dark py-3 text-sm font-semibold text-cream"
            >
              <MessageCircle size={16} />
              Enquire Now
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
