import { getApiUrl } from "@/lib/backend";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const jar = await cookies();
    const token = jar.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action as string;

    const path =
      action === "setup"
        ? "/api/admin/2fa/setup"
        : action === "enable"
          ? "/api/admin/2fa/enable"
          : action === "disable"
            ? "/api/admin/2fa/disable"
            : null;

    if (!path) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const res = await fetch(`${getApiUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
