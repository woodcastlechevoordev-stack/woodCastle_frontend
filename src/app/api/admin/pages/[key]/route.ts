import { proxyToBackend } from "@/lib/admin-proxy";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ key: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  return proxyToBackend(req, `/api/admin/pages/${key}`, { method: "GET" });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  return proxyToBackend(req, `/api/admin/pages/${key}`, { method: "PATCH" });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  return proxyToBackend(req, `/api/admin/pages/${key}`, { method: "PATCH" });
}
