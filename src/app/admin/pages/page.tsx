"use client";

import { PageForm } from "@/components/admin/PageForm";
import { Button } from "@/components/ui/Button";
import type { StaticPage } from "@/lib/types";
import { unwrapList } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";

const PAGE_KEYS = [
  { key: "about", label: "About Us", path: "/about" },
  { key: "terms", label: "Terms & Conditions", path: "/terms-and-conditions" },
  { key: "contact", label: "Contact", path: "/contact" },
] as const;

export default function AdminPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/pages");
    const data = await res.json().catch(() => []);
    setPages(unwrapList<StaticPage>(data));
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(
    () =>
      PAGE_KEYS.map((meta) => {
        const page = pages.find((p) => p.key === meta.key);
        return { ...meta, page };
      }),
    [pages]
  );

  const editingMeta = PAGE_KEYS.find((p) => p.key === editingKey);

  return (
    <div>
      <h1 className="font-heading text-3xl text-brown-dark">Pages</h1>
      <p className="mt-1 text-brown-mid">
        Edit About, Terms &amp; Conditions, and Contact content
      </p>

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brown-light bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="font-heading text-xl text-brown-dark">{row.label}</h2>
              <p className="mt-1 text-sm text-brown-mid">
                {row.page?.title || "Not edited yet"}
                {row.page?.updatedAt
                  ? ` · Updated ${format(new Date(row.page.updatedAt), "MMM d, yyyy")}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={row.path}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brown-mid hover:text-gold"
              >
                View
              </a>
              <Button variant="outline" size="sm" onClick={() => setEditingKey(row.key)}>
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingKey && editingMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
            <h3 className="font-heading text-2xl text-brown-dark">
              Edit {editingMeta.label}
            </h3>
            <PageForm
              key={editingKey}
              pageKey={editingKey}
              fallbackTitle={editingMeta.label}
              onCancel={() => setEditingKey(null)}
              onSaved={(saved, values) => {
                setPages((prev) => {
                  const next = prev.filter((p) => p.key !== editingKey);
                  next.push(
                    saved || {
                      id: editingKey,
                      key: editingKey,
                      title: values.title,
                      content: values.content,
                    }
                  );
                  return next;
                });
                setEditingKey(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
