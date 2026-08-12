import { createHash } from "crypto";

export function sanitizeCloudinaryFolder(input?: string | null): string {
  const folder = (input || "woodcastle")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .slice(0, 80);
  return folder || "woodcastle";
}

export function signCloudinaryUpload(folderInput?: string | null) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  const folder = sanitizeCloudinaryFolder(folderInput);
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
  };
}
