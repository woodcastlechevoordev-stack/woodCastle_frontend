import { toCloudinaryFolder } from "./cloudinary-sign";

export type CloudinarySignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  format?: string;
};

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type CloudinaryUploadResult = {
  url: string;
  bytes: number | null;
  originalBytes: number;
};

const SIGN_META_KEYS = new Set(["cloudName", "apiKey", "error"]);

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    const rounded = kb >= 10 ? Math.round(kb) : Number(kb.toFixed(1));
    return `${rounded} KB`;
  }
  const mb = bytes / (1024 * 1024);
  const rounded = Number(mb.toFixed(1));
  return `${rounded} MB`;
}

export function uploadSavingsLabel(originalBytes: number, convertedBytes: number): string {
  const from = formatFileSize(originalBytes);
  const to = formatFileSize(convertedBytes);
  if (originalBytes <= 0 || convertedBytes >= originalBytes) {
    return `${from} → ${to}`;
  }
  const percent = Math.round((1 - convertedBytes / originalBytes) * 100);
  return `${from} → ${to} (${percent}% smaller)`;
}

/**
 * Request a signed upload payload from the admin API, then POST the file
 * directly to Cloudinary (browser → Cloudinary, not through our server).
 * Every field returned by the signature endpoint is sent back as-is (spec §5b / §8).
 */
export async function uploadToCloudinary(
  file: File,
  folder = "products",
  onProgress?: (p: UploadProgress) => void
): Promise<CloudinaryUploadResult> {
  const signRes = await fetch("/api/admin/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: toCloudinaryFolder(folder) }),
  });
  const signData = (await signRes.json()) as CloudinarySignResponse & {
    error?: string;
  };
  if (!signRes.ok) {
    throw new Error(signData.error || "Could not prepare image upload");
  }
  if (!signData.cloudName || !signData.apiKey || !signData.signature) {
    throw new Error("Could not prepare image upload");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", String(signData.apiKey));
  form.append("signature", String(signData.signature));
  for (const [key, value] of Object.entries(signData)) {
    if (value == null || SIGN_META_KEYS.has(key) || key === "signature") continue;
    form.append(key, String(value));
  }

  const url = `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`;

  const uploaded = await new Promise<{ url: string; bytes: number | null }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable || !onProgress) return;
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText) as {
            secure_url?: string;
            bytes?: number;
            error?: { message?: string };
          };
          if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
            resolve({
              url: data.secure_url,
              bytes: typeof data.bytes === "number" ? data.bytes : null,
            });
          } else {
            reject(new Error(data.error?.message || "Cloudinary upload failed"));
          }
        } catch {
          reject(new Error("Cloudinary upload failed"));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(form);
    }
  );

  return {
    url: uploaded.url,
    bytes: uploaded.bytes,
    originalBytes: file.size,
  };
}
