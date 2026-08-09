"use client";

import { Button } from "@/components/ui/Button";
import type { ImportPreviewResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type Step = "upload" | "preview" | "done";

export default function ProductImportPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!/\.xlsx$/i.test(file.name)) {
      setError("Please upload a .xlsx file.");
      return;
    }

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/import/preview", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Preview failed");
      }
      setPreview(data as ImportPreviewResult);
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
      setPreview(null);
      setStep("upload");
    } finally {
      setLoading(false);
    }
  }, []);

  async function confirmImport() {
    if (!preview?.importId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId: preview.importId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Confirm failed");
      }
      setConfirmMessage(
        `Import complete — ${data.successCount ?? 0} of ${data.totalRows ?? 0} rows applied${
          data.errorCount ? ` (${data.errorCount} errors)` : ""
        }.`
      );
      setStep("done");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confirm failed");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  const hasBlockingErrors = (preview?.summary.errorCount ?? 0) > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-brown-mid">
            <Link href="/admin/products" className="hover:text-gold">
              Products
            </Link>{" "}
            / Import
          </p>
          <h1 className="mt-1 font-heading text-3xl text-brown-dark">
            Import from Sheet
          </h1>
          <p className="mt-1 text-brown-mid">
            Upload the Woodcastle .xlsx template, review the preview, then confirm.
          </p>
        </div>
        <a href="/api/admin/import/template">
          <Button variant="outline" type="button">
            <Download size={16} />
            Download Template
          </Button>
        </a>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {step === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 transition",
            dragging
              ? "border-gold bg-gold-light/30"
              : "border-brown-light bg-white hover:border-gold/60"
          )}
        >
          <Upload className="text-brown-light" size={36} strokeWidth={1.5} />
          <p className="mt-4 font-heading text-xl text-brown-dark">
            Drop your .xlsx file here
          </p>
          <p className="mt-2 text-sm text-brown-mid">
            or choose a file from your computer
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file);
            }}
          />
          <Button
            variant="gold"
            className="mt-6"
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? "Uploading…" : "Choose file"}
          </Button>
        </div>
      )}

      {step === "preview" && preview && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brown-light bg-white p-4 shadow-sm">
            <FileSpreadsheet className="text-gold" size={22} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-brown-dark">{fileName || preview.fileName}</p>
              <p className="text-xs text-brown-mid">
                Preview expires {new Date(preview.expiresAt).toLocaleString("en-IN")}
              </p>
            </div>
            <Button
              variant="outline"
              type="button"
              disabled={loading}
              onClick={() => {
                setStep("upload");
                setPreview(null);
                setError(null);
              }}
            >
              Upload another
            </Button>
            <Button
              variant="gold"
              type="button"
              disabled={loading || hasBlockingErrors}
              onClick={() => void confirmImport()}
            >
              {loading ? "Confirming…" : "Confirm Import"}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                label: "Products create",
                value: preview.summary.productsToCreate,
                tone: "gold" as const,
              },
              {
                label: "Products update",
                value: preview.summary.productsToUpdate,
                tone: "brown" as const,
              },
              {
                label: "Categories create",
                value: preview.summary.categoriesToCreate,
                tone: "gold" as const,
              },
              {
                label: "Categories update",
                value: preview.summary.categoriesToUpdate,
                tone: "brown" as const,
              },
              {
                label: "Errors",
                value: preview.summary.errorCount,
                tone: "red" as const,
              },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-xl border px-4 py-3",
                  s.tone === "gold" && "border-gold/40 bg-gold-light/40",
                  s.tone === "brown" && "border-brown-light bg-cream",
                  s.tone === "red" && "border-red-200 bg-red-50"
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-brown-mid">
                  {s.label}
                </p>
                <p
                  className={cn(
                    "mt-1 font-heading text-2xl",
                    s.tone === "red" ? "text-red-700" : "text-brown-dark"
                  )}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {hasBlockingErrors && (
            <p className="text-sm text-red-700">
              Fix the errors in your sheet and re-upload before confirming.
            </p>
          )}

          {preview.errors.length > 0 && (
            <section className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
              <div className="border-b border-red-100 bg-red-50 px-4 py-3">
                <h2 className="font-heading text-lg text-red-900">Errors</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-brown-light/40 text-brown-mid">
                    <tr>
                      <th className="px-4 py-2 font-medium">Sheet</th>
                      <th className="px-4 py-2 font-medium">Row</th>
                      <th className="px-4 py-2 font-medium">Field</th>
                      <th className="px-4 py-2 font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {preview.errors.map((err, i) => (
                      <tr key={`${err.sheet}-${err.row}-${i}`} className="bg-red-50/40">
                        <td className="px-4 py-2 text-brown-dark">{err.sheet}</td>
                        <td className="px-4 py-2 text-brown-dark">{err.row}</td>
                        <td className="px-4 py-2 text-brown-mid">{err.field || "—"}</td>
                        <td className="px-4 py-2 text-red-800">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {preview.categories.length > 0 && (
            <PreviewTable
              title="Categories"
              headers={["Row", "Name", "Slug", "Action"]}
              rows={preview.categories.map((c) => ({
                key: `cat-${c.rowNumber}-${c.slug}`,
                action: c.action,
                cells: [String(c.rowNumber), c.name, c.slug, c.action],
              }))}
            />
          )}

          {preview.products.length > 0 && (
            <PreviewTable
              title="Products"
              headers={["Row", "Name", "Category", "Slug", "Action"]}
              rows={preview.products.map((p) => ({
                key: `prod-${p.rowNumber}-${p.slug}`,
                action: p.action,
                cells: [
                  String(p.rowNumber),
                  p.name,
                  p.categoryName,
                  p.slug,
                  p.action,
                ],
              }))}
            />
          )}
        </div>
      )}

      {step === "done" && (
        <div className="mt-8 rounded-xl border border-gold/40 bg-gold-light/30 p-8 text-center">
          <p className="font-heading text-2xl text-brown-dark">Import confirmed</p>
          {confirmMessage && (
            <p className="mx-auto mt-3 max-w-xl text-sm text-brown-mid">{confirmMessage}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/admin/products">
              <Button variant="gold">Back to products</Button>
            </Link>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setStep("upload");
                setPreview(null);
                setConfirmMessage(null);
                setError(null);
              }}
            >
              Import another sheet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: { key: string; action: "create" | "update"; cells: string[] }[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-brown-light bg-white shadow-sm">
      <div className="border-b border-brown-light bg-cream/80 px-4 py-3">
        <h2 className="font-heading text-lg text-brown-dark">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-brown-light/40 text-brown-mid">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brown-light/30">
            {rows.map((row) => (
              <tr
                key={row.key}
                className={cn(
                  row.action === "create" && "bg-gold-light/25",
                  row.action === "update" && "bg-cream/80"
                )}
              >
                {row.cells.map((cell, i) => (
                  <td
                    key={`${row.key}-${i}`}
                    className={cn(
                      "px-4 py-2",
                      i === row.cells.length - 1
                        ? "font-semibold capitalize text-brown-dark"
                        : "text-brown-dark"
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
