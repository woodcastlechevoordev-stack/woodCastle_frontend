"use client";

import { cn } from "@/lib/utils";
import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ShareButtonProps = {
  title: string;
  urlPath: string;
  className?: string;
  variant?: "icon" | "label";
};

function absoluteUrl(path: string): string {
  if (typeof window !== "undefined") {
    return new URL(path, window.location.origin).toString();
  }
  return path;
}

function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function ShareButton({
  title,
  urlPath,
  className,
  variant = "icon",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nativeShare, setNativeShare] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNativeShare(canUseNativeShare());
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function share() {
    const url = absoluteUrl(urlPath);
    if (canUseNativeShare()) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    setOpen((v) => !v);
  }

  async function copyLink() {
    const url = absoluteUrl(urlPath);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setOpen(false);
    } catch {
      setCopied(false);
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${absoluteUrl(urlPath)}`)}`;

  return (
    <div className={className} ref={rootRef}>
      <div className="relative">
        <button
          type="button"
          onClick={share}
          aria-label={`Share ${title}`}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-brown-light/60 bg-white/95 text-brown-dark shadow-sm transition-colors hover:border-gold hover:text-gold",
            variant === "label" ? "gap-2 px-3 py-2 text-sm font-semibold" : "h-9 w-9"
          )}
        >
          <Share2 size={16} />
          {variant === "label" && <span>Share</span>}
        </button>

        {open && !nativeShare && (
          <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-brown-light/50 bg-white py-1 shadow-lg">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="block px-3 py-2 text-sm text-brown-dark hover:bg-cream hover:text-gold"
              onClick={() => setOpen(false)}
            >
              Share on WhatsApp
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brown-dark hover:bg-cream hover:text-gold"
            >
              <Copy size={14} />
              Copy Link
            </button>
          </div>
        )}

        {copied && (
          <p className="absolute right-0 top-full z-50 mt-2 flex items-center gap-1.5 rounded-lg bg-brown-dark px-3 py-1.5 text-xs font-medium text-cream shadow-lg">
            <Check size={12} />
            Link copied
          </p>
        )}
      </div>
    </div>
  );
}
