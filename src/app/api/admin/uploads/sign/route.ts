import { signCloudinaryUpload } from "@/lib/cloudinary-sign";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/** @deprecated Prefer POST /api/admin/upload/signature */
export async function GET(req: NextRequest) {
  const jar = await cookies();
  if (!jar.get("admin_token")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = signCloudinaryUpload(req.nextUrl.searchParams.get("folder"));
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
