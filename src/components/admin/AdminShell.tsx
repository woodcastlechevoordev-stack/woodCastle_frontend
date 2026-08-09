"use client";

import { siteInfo } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/2fa-setup";

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-cream lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-brown-light/50 bg-brown-dark text-cream transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[4.75rem] items-center justify-between border-b border-brown-light/40 bg-white px-4">
          <Link href="/admin" className="inline-flex min-w-0 items-center">
            <Image
              src="/brand/logo.png"
              alt={`${siteInfo.name} Admin`}
              width={865}
              height={479}
              priority
              className="h-12 w-auto max-w-[168px] object-contain object-left"
            />
          </Link>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-brown-dark lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <p className="px-5 pt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-light/70">
          Admin
        </p>
        <nav className="mt-2 space-y-1 px-3">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-gold/20 text-gold"
                    : "text-cream/80 hover:bg-white/5 hover:text-cream"
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="absolute bottom-6 left-3 right-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream/70 hover:bg-white/5 hover:text-cream"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-brown-dark/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-brown-light/50 bg-white px-4 lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-brown-dark lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          <p className="text-sm text-brown-mid">Woodcastle Admin Panel</p>
          <Link
            href="/"
            target="_blank"
            className="ml-auto text-sm font-medium text-gold hover:underline"
          >
            View site
          </Link>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
