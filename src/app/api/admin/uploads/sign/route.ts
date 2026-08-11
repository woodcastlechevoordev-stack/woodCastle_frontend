import { createHash } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns a Cloudinary signed-upload payload for the admin browser client.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
 */
export async function GET(req: NextRequest) {
  const jar = await cookies();
  if (!jar.get("admin_token")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
      { status: 503 }
    );
  }

  const folderParam = req.nextUrl.searchParams.get("folder") || "woodcastle";
  const folder = folderParam.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 80) || "woodcastle";
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signature: sorted params joined as key=value, then + api_secret, SHA-1
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
  });
}
