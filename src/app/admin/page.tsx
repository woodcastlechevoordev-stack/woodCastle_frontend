import { adminBackendFetch } from "@/lib/admin-api";
import type { Enquiry, Offer, Product, BlogPost } from "@/lib/types";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Package,
  Tag,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let enquiries: Enquiry[] = [];
  let products: Product[] = [];
  let posts: BlogPost[] = [];
  let offers: Offer[] = [];

  try {
    [enquiries, products, posts, offers] = await Promise.all([
      adminBackendFetch<Enquiry[]>("/api/admin/enquiries"),
      adminBackendFetch<Product[]>("/api/admin/products"),
      adminBackendFetch<BlogPost[]>("/api/admin/blog"),
      adminBackendFetch<Offer[]>("/api/admin/offers"),
    ]);
  } catch {
    // cookie missing or backend down
  }

  const newEnquiries = enquiries.filter((e) => e.status === "new").length;
  const activeOffers = offers.filter((o) => o.isActive).length;

  const cards = [
    {
      label: "New enquiries",
      value: newEnquiries,
      href: "/admin/enquiries",
      icon: MessageSquare,
      hint: "Awaiting response",
    },
    {
      label: "Products",
      value: products.length,
      href: "/admin/products",
      icon: Package,
      hint: "In catalogue",
    },
    {
      label: "Blog posts",
      value: posts.length,
      href: "/admin/blog",
      icon: FileText,
      hint: "All posts",
    },
    {
      label: "Active offers",
      value: activeOffers,
      href: "/admin/offers",
      icon: Tag,
      hint: "Currently live",
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl text-brown-dark">Dashboard</h1>
      <p className="mt-1 text-brown-mid">Overview of your Woodcastle storefront.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border border-brown-light bg-white p-5 shadow-sm transition-colors hover:border-gold"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-brown-mid">{card.label}</p>
                <Icon size={18} className="text-gold" />
              </div>
              <p className="mt-3 font-heading text-3xl text-brown-dark">{card.value}</p>
              <p className="mt-1 text-xs text-brown-light">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-brown-light bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl text-brown-dark">Recent enquiries</h2>
        {enquiries.length === 0 ? (
          <p className="mt-4 text-sm text-brown-mid">No enquiries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-brown-light/50">
            {enquiries.slice(0, 5).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium text-brown-dark">{e.name}</p>
                  <p className="text-sm text-brown-mid">
                    {e.product?.name || "General enquiry"}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/enquiries"
          className="mt-4 inline-block text-sm font-semibold text-gold hover:underline"
        >
          View all enquiries
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-gold-light text-brown-dark",
    contacted: "bg-brown-light/40 text-brown-dark",
    closed: "bg-gray-200 text-gray-600",
  };
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] ?? styles.closed}`}
    >
      {status}
    </span>
  );
}
