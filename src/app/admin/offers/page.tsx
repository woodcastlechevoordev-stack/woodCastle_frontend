"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Offer } from "@/lib/types";
import { offerFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof offerFormSchema>;

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [error, setError] = useState("");

  const form = useForm<Values>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: "",
      discountText: "",
      description: "",
      startDate: "",
      endDate: "",
      active: true,
    },
  });

  async function load() {
    const res = await fetch("/api/admin/offers");
    const data = await res.json();
    if (Array.isArray(data)) setOffers(data);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setError("");
    form.reset({
      title: "",
      discountText: "",
      description: "",
      startDate: "",
      endDate: "",
      active: true,
    });
    setOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditing(offer);
    setError("");
    form.reset({
      title: offer.title,
      discountText: offer.discountText || "",
      description: offer.description || "",
      startDate: offer.startsAt ? offer.startsAt.slice(0, 10) : "",
      endDate: offer.endsAt ? offer.endsAt.slice(0, 10) : "",
      active: offer.isActive,
    });
    setOpen(true);
  }

  async function onSubmit(values: Values) {
    setError("");
    const payload = {
      title: values.title,
      discountText: values.discountText,
      description: values.description,
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

      <div className="mt-8 space-y-4">
        {offers.map((o) => (
          <div
            key={o.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brown-light bg-white p-5 shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl text-brown-dark">{o.title}</h2>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                    o.isActive ? "bg-gold-light text-brown-dark" : "bg-gray-200 text-gray-600"
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
            <Button variant="outline" size="sm" onClick={() => openEdit(o)}>
              Edit
            </Button>
          </div>
        ))}
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
