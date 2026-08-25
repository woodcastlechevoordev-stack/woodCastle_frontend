import { createHash } from "crypto";

export const CLOUDINARY_FOLDERS = [
  "products",
  "categories",
  "offers",
  "blog",
  "reviews",
] as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[number];

const FOLDER_SET = new Set<string>(CLOUDINARY_FOLDERS);

/** Cloudinary converts every admin upload to WebP at upload time (backend spec §5b). */
export const CLOUDINARY_UPLOAD_FORMAT = "webp";

/**
 * Backend spec §5b allows `products` | `categories` | `offers` | `blog` | `reviews`.
 * Older UI sent `woodcastle/products` — map those to the leaf folder name.
 */
export function toCloudinaryFolder(input?: string | null): CloudinaryFolder {
  const raw = String(input || "products")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .slice(0, 80);
  const leaf = raw.split("/").filter(Boolean).pop() || "products";
  return FOLDER_SET.has(leaf) ? (leaf as CloudinaryFolder) : "products";
}

/** @deprecated Use toCloudinaryFolder — kept so older imports keep compiling. */
export function sanitizeCloudinaryFolder(input?: string | null): string {
  return toCloudinaryFolder(input);
}

function signParams(params: Record<string, string | number>, apiSecret: string) {
  const toSign =
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&") + apiSecret;
  return createHash("sha1").update(toSign).digest("hex");
}

export function signCloudinaryUpload(folderInput?: string | null) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  const folder = toCloudinaryFolder(folderInput);
  const timestamp = Math.floor(Date.now() / 1000);
  const format = CLOUDINARY_UPLOAD_FORMAT;
  const signature = signParams({ folder, format, timestamp }, apiSecret);

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    format,
  };
}
