"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useId, useRef } from "react";

type ConfirmDeleteDialogProps = {
  open: boolean;
  itemName: string;
  warning?: string;
  error?: string;
  loading?: boolean;
  /** When true, delete is blocked (e.g. category still has products). */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDeleteDialog({
  open,
  itemName,
  warning,
  error,
  loading,
  confirmDisabled,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/50 p-4"
      role="presentation"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="font-heading text-2xl text-brown-dark">
          Delete {itemName}?
        </h3>
        <p className="mt-2 text-sm text-brown-mid">This can&apos;t be undone.</p>
        {warning && (
          <p className="mt-3 rounded-lg border border-gold bg-gold-light/40 px-3 py-2 text-sm text-brown-dark">
            {warning}
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {!confirmDisabled && (
            <Button
              type="button"
              variant="outline"
              className="border-red-300 text-red-700 hover:border-red-500 hover:text-red-800"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onCancel}
          >
            {confirmDisabled ? "Close" : "Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
}
