"use client";

import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type DeleteActionProps = {
  endpoint: string;
  itemName: string;
  /** Shown in the dialog before the request (e.g. category has products). */
  warning?: string;
  /** If true, confirm is disabled / only Cancel is useful until resolved. */
  blocked?: boolean;
  className?: string;
  onDeleted?: () => void;
};

export function DeleteAction({
  endpoint,
  itemName,
  warning,
  blocked,
  className,
  onDeleted,
}: DeleteActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const close = useCallback(() => {
    if (loading) return;
    setOpen(false);
    setError("");
  }, [loading]);

  async function confirm() {
    if (blocked) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to delete. Please try again."
        );
        setLoading(false);
        return;
      }
      setOpen(false);
      onDeleted?.();
      router.refresh();
    } catch {
      setError("Failed to delete. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className={
          className ||
          "font-medium text-red-700 hover:text-red-900 hover:underline"
        }
      >
        Delete
      </button>
      <ConfirmDeleteDialog
        open={open}
        itemName={itemName}
        warning={
          blocked
            ? warning ||
              "This item can't be deleted until related records are reassigned or removed."
            : warning
        }
        error={error}
        loading={loading}
        confirmDisabled={blocked}
        onConfirm={confirm}
        onCancel={close}
      />
    </>
  );
}
