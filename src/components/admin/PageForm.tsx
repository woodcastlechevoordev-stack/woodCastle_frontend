"use client";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { StaticPage } from "@/lib/types";
import { staticPageFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof staticPageFormSchema>;

export function asPage(data: unknown): StaticPage | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.page && typeof obj.page === "object") return obj.page as StaticPage;
  if (typeof obj.key === "string" && typeof obj.title === "string") {
    return data as StaticPage;
  }
  return null;
}

function PageFormFields({
  pageKey,
  defaultValues,
  onCancel,
  onSaved,
}: {
  pageKey: string;
  defaultValues: Values;
  onCancel: () => void;
  onSaved: (page: StaticPage | null, values: Values) => void;
}) {
  const [message, setMessage] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(staticPageFormSchema),
    defaultValues,
  });

  async function onSubmit(values: Values) {
    setMessage("");
    const res = await fetch(`/api/admin/pages/${encodeURIComponent(pageKey)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: values.title, content: values.content }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(
        typeof data.error === "string" ? data.error : "Failed to save page"
      );
      return;
    }
    onSaved(asPage(data), values);
  }

  return (
    <form
      data-testid="page-editor-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="mt-5 space-y-4"
    >
      <Input id="page-title" label="Title" {...form.register("title")} />
      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => (
          <RichTextEditor
            key={pageKey}
            id="page-content"
            label="Content"
            placeholder="Write page content…"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      {message && <p className="text-sm text-red-600">{message}</p>}
      <div className="flex gap-3">
        <Button
          type="submit"
          variant="gold"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function PageForm({
  pageKey,
  fallbackTitle,
  onCancel,
  onSaved,
}: {
  pageKey: string;
  fallbackTitle: string;
  onCancel: () => void;
  onSaved: (page: StaticPage | null, values: Values) => void;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [initial, setInitial] = useState<Values | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setLoadError("");
      setInitial(null);
      try {
        const res = await fetch(
          `/api/admin/pages/${encodeURIComponent(pageKey)}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok && res.status !== 404) {
          setLoadError(
            typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Failed to load page"
          );
          setStatus("error");
          return;
        }
        const page = asPage(data);
        setInitial({
          title: page?.title || fallbackTitle,
          content: page?.content || "<p></p>",
        });
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setLoadError("Failed to load page");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pageKey, fallbackTitle]);

  if (status === "loading") {
    return (
      <p data-testid="page-editor-loading" className="mt-5 text-sm text-brown-mid">
        Loading page content…
      </p>
    );
  }

  if (status === "error" || !initial) {
    return (
      <div className="mt-5 space-y-4">
        <p className="text-sm text-red-600">{loadError || "Failed to load page"}</p>
        <Button type="button" variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <PageFormFields
      pageKey={pageKey}
      defaultValues={initial}
      onCancel={onCancel}
      onSaved={onSaved}
    />
  );
}
