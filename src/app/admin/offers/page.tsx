"use client";

import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { DeleteAction } from "@/components/admin/DeleteAction";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Offer } from "@/lib/types";
import { offerFormSchema } from "@/lib/validations";
import { queryString, unwrapList } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof offerFormSchema>;

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const form = useForm<Values>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: "",
      discountText: "",
      description: "",
      bannerImage: "",
      startDate: "",
      endDate: "",
      active: true,
    },
  });

  async function load() {
    const isActive =
      status === "active" ? "true" : status === "inactive" ? "false" : undefined;
    const qs = queryString({
      search: search.trim() || undefined,
      isActive,
    });
    const res = await fetch(`/api/admin/offers${qs}`);
    const data = await res.json();
    const items = unwrapList<Offer>(data);
    setOffers(
      items.filter((o) => {
        if (status === "active" && !o.isActive) return false;
        if (status === "inactive" && o.isActive) return false;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          if (!o.title.toLowerCase().includes(q)) return false;
        }
        return true;
      })
    );
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      load();
    }, search ? 300 : 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  function openCreate() {
    setEditing(null);
    setError("");
    setBannerImage(null);
    form.reset({
      title: "",
      discountText: "",
      description: "",
      bannerImage: "",
      startDate: "",
      endDate: "",
      active: true,
    });
    setOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditing(offer);
    setError("");
    setBannerImage(offer.bannerImage);
    form.reset({
      title: offer.title,
      discountText: offer.discountText || "",
      description: offer.description || "",
      bannerImage: offer.bannerImage || "",
      startDate: offer.startsAt ? offer.startsAt.slice(0, 10) : "",
      endDate: offer.endsAt ? offer.endsAt.slice(0, 10) : "",
      active: offer.isActive,
    });
    setOpen(true);
  }

  async function onSubmit(values: Values) {
    setError("");
    if (!bannerImage) {
      setError("Please upload a banner image.");
      return;
    }
    const payload = {
      title: values.title,
      discountText: values.discountText,
      description: values.description,
      bannerImage,
      startsAt: values.startDate ? new Date(values.startDate).toISOString() : null,
      endsAt: values.endDate ? new Date(values.endDate).toISOString() : null,
      isActive: values.active,
    };
    const res = await fetch(
      editing ? `/api/admin/offers/${editing.id}` : "/api/admin/offers",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save");
      return;
    }
    setOpen(false);
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-brown-dark">Offers</h1>
          <p className="mt-1 text-brown-mid">Schedule promotions with start/end dates</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          Add offer
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | "active" | "inactive")}
          className="w-full rounded-lg border border-brown-light bg-white px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold sm:max-w-[180px]"
        >
          <option value="all">All offers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {offers.map((o) => (
          <div
            key={o.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brown-light bg-white p-5 shadow-sm"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
              {o.bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={o.bannerImage}
                  alt=""
                  className="h-16 w-28 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-xl text-brown-dark">{o.title}</h2>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      o.isActive
                        ? "bg-gold-light text-brown-dark"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {o.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {o.discountText && (
                  <p className="mt-1 text-sm font-medium text-gold">{o.discountText}</p>
                )}
                <p className="mt-2 text-sm text-brown-mid">
                  {o.startsAt ? format(new Date(o.startsAt), "MMM d, yyyy") : "—"} –{" "}
                  {o.endsAt ? format(new Date(o.endsAt), "MMM d, yyyy") : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => openEdit(o)}>
                Edit
              </Button>
              <DeleteAction
                endpoint={`/api/admin/offers/${o.id}`}
                itemName={o.title}
                onDeleted={load}
              />
            </div>
          </div>
        ))}
        {offers.length === 0 && (
          <p className="rounded-xl border border-brown-light bg-white p-6 text-sm text-brown-mid">
            No offers match these filters.
          </p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
            <h3 className="font-heading text-2xl text-brown-dark">
              {editing ? "Edit offer" : "New offer"}
            </h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <Input id="offer-title" label="Title" {...form.register("title")} />
              <Input
                id="offer-discount"
                label="Discount text"
                {...form.register("discountText")}
              />
              <Textarea
                id="offer-desc"
                label="Description"
                {...form.register("description")}
              />
              <CloudinaryImageUpload
                mode="single"
                label="Banner image"
                helpText="Drag and drop to upload the offer banner directly to Cloudinary."
                folder="woodcastle/offers"
                value={bannerImage}
                onChange={(url) => {
                  setBannerImage(url);
                  form.setValue("bannerImage", url || "", { shouldValidate: true });
                }}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="offer-start"
                  label="Start date"
                  type="date"
                  {...form.register("startDate")}
                />
                <Input
                  id="offer-end"
                  label="End date"
                  type="date"
                  {...form.register("endDate")}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-brown-dark">
                <input type="checkbox" {...form.register("active")} className="accent-gold" />
                Active
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <Button type="submit" variant="gold">
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
