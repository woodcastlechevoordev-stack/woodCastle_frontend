export type CloudinarySignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

/**
 * Request a signed upload payload from the admin API, then POST the file
 * directly to Cloudinary (browser → Cloudinary, not through our server).
 */
export async function uploadToCloudinary(
  file: File,
  folder = "woodcastle",
  onProgress?: (p: UploadProgress) => void
): Promise<string> {
  const signRes = await fetch("/api/admin/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const signData = (await signRes.json()) as CloudinarySignResponse & {
    error?: string;
  };
  if (!signRes.ok) {
    throw new Error(signData.error || "Could not prepare image upload");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signData.apiKey);
  form.append("timestamp", String(signData.timestamp));
  form.append("signature", signData.signature);
  form.append("folder", signData.folder);

  const url = `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`;

  const secureUrl = await new Promise<string>((resolve, reject) => {
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
          error?: { message?: string };
        };
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(new Error(data.error?.message || "Cloudinary upload failed"));
        }
      } catch {
        reject(new Error("Cloudinary upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });

  return secureUrl;
}
