"use client";

import { Button } from "@/components/ui/Button";
import { buildSimpleXlsx, downloadXlsx } from "@/lib/simple-xlsx";
import type { Enquiry, EnquiryStatus } from "@/lib/types";
import { queryString, unwrapList, cn } from "@/lib/utils";
import { Check, Copy, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

const statuses: Array<EnquiryStatus | "all"> = ["all", "new", "contacted", "closed"];

function enquiryShareText(e: Enquiry): string {
  const productUrl =
    e.product?.slug && typeof window !== "undefined"
      ? `${window.location.origin}/product/${e.product.slug}`
      : "";
  return [
    "Woodcastle enquiry",
    `Name: ${e.name}`,
    `Phone: ${e.phone}`,
    `Product: ${e.product?.name || "—"}`,
    productUrl ? `Link: ${productUrl}` : "",
    `Date: ${format(new Date(e.createdAt), "d MMM yyyy, h:mm a")}`,
    `Status: ${e.status}`,
    "",
    e.message,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  async function load() {
    const qs = queryString({
      search: debouncedSearch || undefined,
      status: filter === "all" ? undefined : filter,
    });
    const res = await fetch(`/api/admin/enquiries${qs}`);
    const data = await res.json();
    setEnquiries(unwrapList<Enquiry>(data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, debouncedSearch]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return enquiries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      const hay = `${e.name} ${e.phone} ${e.product?.name || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [enquiries, filter, debouncedSearch]);

  async function copyEnquiry(e: Enquiry) {
    try {
      await navigator.clipboard.writeText(enquiryShareText(e));
      setCopiedId(e.id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === e.id ? null : current));
      }, 2000);
    } catch {
      setCopiedId(null);
    }
  }

  async function copyAllEnquiries() {
    const text = filtered.map(enquiryShareText).join("\n\n———\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId("all");
      window.setTimeout(() => {
        setCopiedId((current) => (current === "all" ? null : current));
      }, 2000);
    } catch {
      setCopiedId(null);
    }
  }

  function downloadExcel() {
    const rows = [
      ["Date", "Name", "Phone", "Product", "Status", "Message"],
      ...filtered.map((e) => [
        format(new Date(e.createdAt), "yyyy-MM-dd HH:mm"),
        e.name,
        e.phone,
        e.product?.name || "",
        e.status,
        e.message,
      ]),
    ];
    const bytes = buildSimpleXlsx([{ name: "Enquiries", rows }]);
    const stamp = format(new Date(), "yyyy-MM-dd");
    const suffix = filter === "all" ? "all" : filter;
    downloadXlsx(`woodcastle-enquiries-${suffix}-${stamp}.xlsx`, bytes);
  }

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl text-brown-dark">Enquiries</h1>
          <p className="mt-1 text-brown-mid">Inbox of product enquiries</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={copyAllEnquiries}
            disabled={filtered.length === 0}
            className="w-full shrink-0 sm:w-auto"
          >
            {copiedId === "all" ? <Check size={16} /> : <Copy size={16} />}
            {copiedId === "all" ? "Copied" : "Copy all"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={downloadExcel}
            disabled={filtered.length === 0}
            className="w-full shrink-0 sm:w-auto"
          >
            <Download size={16} />
            Download Excel
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, or product…"
          className="h-10 w-full rounded-lg border border-brown-light bg-white px-3 text-sm text-brown-dark outline-none focus:border-gold md:max-w-sm"
        />
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "h-10 shrink-0 rounded-lg px-3.5 text-sm font-medium capitalize transition-colors",
                filter === s
                  ? "bg-brown-dark text-cream"
                  : "bg-white text-brown-mid border border-brown-light hover:border-gold"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brown-light bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-brown-light bg-cream/80 text-brown-mid">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Copy</span>
              </th>
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
                <td className="px-2 py-3 text-right">
                  <button
                    type="button"
                    aria-label={copiedId === e.id ? "Copied" : `Copy ${e.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyEnquiry(e);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brown-light/70 text-brown-mid transition-colors hover:border-gold hover:text-gold"
                  >
                    {copiedId === e.id ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-6 text-sm text-brown-mid">No enquiries match these filters.</p>
        )}
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
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void copyEnquiry(selected)}
                className="inline-flex items-center gap-2 rounded-lg border border-brown-light px-3 py-1.5 text-xs font-semibold text-brown-dark hover:border-gold"
              >
                {copiedId === selected.id ? <Check size={14} /> : <Copy size={14} />}
                {copiedId === selected.id ? "Copied" : "Copy details"}
              </button>
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
