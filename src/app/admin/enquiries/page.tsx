"use client";

import type { Enquiry, EnquiryStatus } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statuses: Array<EnquiryStatus | "all"> = ["all", "new", "contacted", "closed"];

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("all");
  const [selected, setSelected] = useState<Enquiry | null>(null);

  async function load() {
    const res = await fetch("/api/admin/enquiries");
    const data = await res.json();
    if (Array.isArray(data)) setEnquiries(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter),
    [enquiries, filter]
  );

  async function updateStatus(id: string, status: EnquiryStatus) {
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setSelected(updated);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl text-brown-dark">Enquiries</h1>
      <p className="mt-1 text-brown-mid">Inbox of product enquiries</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === s
                ? "bg-brown-dark text-cream"
                : "bg-white text-brown-mid border border-brown-light hover:border-gold"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brown-light bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-brown-light bg-cream/80 text-brown-mid">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brown-light/40">
            {filtered.map((e) => (
              <tr
                key={e.id}
                className="cursor-pointer hover:bg-cream/50"
                onClick={() => setSelected(e)}
              >
                <td className="px-4 py-3 font-medium text-brown-dark">{e.name}</td>
                <td className="px-4 py-3 text-brown-mid">
                  {e.product?.name || "—"}
                </td>
                <td className="px-4 py-3 text-brown-mid">
                  {format(new Date(e.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <h2 className="font-heading text-2xl text-brown-dark">{selected.name}</h2>
            <p className="mt-1 text-sm text-brown-mid">{selected.phone}</p>
            {selected.product && (
              <p className="mt-4 text-sm">
                Product:{" "}
                <Link
                  href={`/product/${selected.product.slug}`}
                  className="font-medium text-gold hover:underline"
                  target="_blank"
                >
                  {selected.product.name}
                </Link>
              </p>
            )}
            <p className="mt-4 rounded-lg bg-cream p-4 text-sm text-brown-mid">
              {selected.message}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(["new", "contacted", "closed"] as EnquiryStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(selected.id, s)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize",
                    selected.status === s
                      ? "bg-brown-dark text-cream"
                      : "border border-brown-light text-brown-mid hover:border-gold"
                  )}
                >
                  Mark {s}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-auto text-sm text-brown-mid hover:text-brown-dark"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: EnquiryStatus }) {
  const styles = {
    new: "bg-gold-light text-brown-dark",
    contacted: "bg-brown-light/50 text-brown-dark",
    closed: "bg-gray-200 text-gray-600",
  };
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
