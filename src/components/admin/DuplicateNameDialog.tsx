"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useId, useRef } from "react";

type DuplicateNameDialogProps = {
  open: boolean;
  baseName: string;
  subcategoryName: string;
  suggestedName: string;
  onConfirm: () => void;
  onKeepName: () => void;
};

export function DuplicateNameDialog({
  open,
  baseName,
  subcategoryName,
  suggestedName,
  onConfirm,
  onKeepName,
}: DuplicateNameDialogProps) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const onKeepNameRef = useRef(onKeepName);
  onKeepNameRef.current = onKeepName;

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onKeepNameRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/50 p-4"
      role="presentation"
      onClick={() => onKeepNameRef.current()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        data-testid="duplicate-name-dialog"
      >
        <h3 id={titleId} className="font-heading text-2xl text-brown-dark">
          Duplicate product name
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-brown-mid">
          A product named &ldquo;{baseName}&rdquo; already exists in {subcategoryName}.
          Suggested name: &ldquo;{suggestedName}&rdquo;.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button ref={confirmRef} type="button" variant="gold" onClick={onConfirm}>
            Confirm
          </Button>
          <Button type="button" variant="outline" onClick={onKeepName}>
            Keep My Name
          </Button>
        </div>
      </div>
    </div>
  );
}
