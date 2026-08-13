import { backendFetch } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

/** Public product search proxy for live suggestions (spec §3.1a). */
export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  try {
    const data = await backendFetch<unknown>(
      `/api/products${qs ? `?${qs}` : ""}`,
      { cache: "no-store" }
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ items: [] });
  }
}
