/** Shared fallback used when CMS/import data has missing or demo-only image URLs. */
export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80";

const BLOCKED_HOSTS = new Set([
  "example.com",
  "www.example.com",
  "example.org",
  "www.example.org",
  "example.net",
  "www.example.net",
]);

/**
 * Returns a URL safe for `next/image`.
 * Sample import URLs (example.com) and browser-only blob: URLs fall back to a real image.
 */
export function safeImageUrl(
  url: string | null | undefined,
  fallback: string = FALLBACK_IMAGE
): string {
  if (!url?.trim()) return fallback;

  try {
    const parsed = new URL(url);
    if (BLOCKED_HOSTS.has(parsed.hostname.toLowerCase())) return fallback;
    if (parsed.protocol === "blob:") return fallback;
    return url;
  } catch {
    return fallback;
  }
}

export function safeImageUrls(
  urls: (string | null | undefined)[] | null | undefined,
  fallback: string = FALLBACK_IMAGE
): string[] {
  const cleaned = (urls || [])
    .map((u) => safeImageUrl(u, ""))
    .filter(Boolean);
  return cleaned.length ? cleaned : [fallback];
}

/**
 * Product OG images should be close to 1200×630 so WhatsApp / social
 * link previews show the photo instead of a cropped square or a missing image.
 */
export function ogImageUrl(url: string | null | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const safe = safeImageUrl(url, "");
  if (!safe) return undefined;

  const match = safe.match(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i
  );
  if (!match) return safe;

  const rest = match[2];
  const firstSegment = rest.split("/")[0] ?? "";
  const alreadyTransformed =
    firstSegment.includes(",") || /^(c_|w_|h_|g_|f_|q_|e_)/.test(firstSegment);
  if (alreadyTransformed) return safe;

  return `${match[1]}c_fill,w_1200,h_630,g_auto/${rest}`;
}
