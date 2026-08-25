import { proxyToBackend } from "@/lib/admin-proxy";
import {
  toCloudinaryFolder,
  signCloudinaryUpload,
} from "@/lib/cloudinary-sign";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function localSignedPayload(folder?: string | null) {
  const jar = await cookies();
  if (!jar.get("admin_token")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = signCloudinaryUpload(toCloudinaryFolder(folder));
  if (!payload) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(payload);
}

/**
 * Spec §8: POST /api/admin/upload/signature → signed Cloudinary upload token.
 * Prefers the backend signature endpoint; falls back to local Cloudinary env signing.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { folder?: string };
  const folder = toCloudinaryFolder(body.folder);

  const proxied = await proxyToBackend(req, "/api/admin/upload/signature", {
    method: "POST",
    body: JSON.stringify({ folder }),
  });

  if (proxied.status >= 200 && proxied.status < 300) {
    const data = (await proxied.json()) as Record<string, unknown>;
    if (data && typeof data.signature === "string") {
      return NextResponse.json(data);
    }
  }

  return localSignedPayload(folder);
}

export async function GET(req: NextRequest) {
  return localSignedPayload(toCloudinaryFolder(req.nextUrl.searchParams.get("folder")));
}
