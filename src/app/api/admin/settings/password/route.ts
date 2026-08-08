import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    error: "Password change is not available via API yet. Use the backend admin tools.",
  }, { status: 501 });
}
