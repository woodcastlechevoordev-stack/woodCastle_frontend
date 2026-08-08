"use client";

import { siteInfo } from "@/lib/api";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, MessageCircle, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80";

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
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const megaRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories.slice(0, 6);
    return categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [categories, query]);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (megaRef.current && !megaRef.current.contains(target)) setMegaOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden border-b border-brown-light/30 bg-brown-dark text-cream/80 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p>Handcrafted Wood Furniture Since {siteInfo.establishedYear}</p>
          <nav className="flex items-center gap-5">
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

      <div className="border-b border-brown-light/40 bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-heading text-2xl tracking-wide text-brown-dark">
            {siteInfo.name}
          </Link>

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
                <div className="absolute left-1/2 top-full z-50 w-[min(720px,70vw)] -translate-x-1/2 pt-3">
                  <div className="rounded-xl border border-brown-light/50 bg-white p-5 shadow-lg">
                    {categories.length === 0 ? (
                      <p className="text-sm text-brown-mid">Collections coming soon.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {categories.slice(0, 6).map((c) => (
                          <Link
                            key={c.id}
                            href={`/category/${c.slug}`}
                            className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-cream"
                          >
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-brown-light/40">
                              <Image
                                src={c.imageUrl || PLACEHOLDER}
                                alt={c.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </span>
                            <span className="text-sm font-medium text-brown-dark group-hover:text-gold">
                              {c.name}
                            </span>
                          </Link>
                        ))}
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
            <div className="relative" ref={searchRef}>
              <button
                type="button"
                aria-label="Search collections"
                onClick={() => setSearchOpen((v) => !v)}
                className="rounded-lg p-2 text-brown-dark transition-colors hover:bg-brown-light/20 hover:text-gold"
              >
                <Search size={20} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-brown-light/50 bg-white p-3 shadow-lg">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search collections…"
                    className="w-full rounded-lg border border-brown-light/60 bg-cream px-3 py-2 text-sm text-brown-dark outline-none focus:border-gold"
                  />
                  <ul className="mt-2 max-h-56 overflow-auto">
                    {filtered.length === 0 ? (
                      <li className="px-2 py-3 text-sm text-brown-mid">No matches</li>
                    ) : (
                      filtered.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/category/${c.slug}`}
                            className="block rounded-lg px-2 py-2 text-sm text-brown-dark hover:bg-cream hover:text-gold"
                            onClick={() => setSearchOpen(false)}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

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

        {open && (
          <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-brown-light/40 bg-cream px-4 py-4 lg:hidden">
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
                  <ul className="mb-2 ml-3 space-y-1 border-l border-brown-light/50 pl-3">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/category/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-brown-mid hover:bg-brown-light/20"
                        >
                          <span className="relative h-10 w-10 overflow-hidden rounded-md">
                            <Image
                              src={c.imageUrl || PLACEHOLDER}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </span>
                          {c.name}
                        </Link>
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
