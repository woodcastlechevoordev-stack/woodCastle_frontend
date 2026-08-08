import { proxyToBackend } from "@/lib/admin-proxy";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, `/api/admin/offers/${id}`, { method: "PATCH" });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, `/api/admin/offers/${id}`, { method: "PATCH" });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, `/api/admin/offers/${id}`, { method: "DELETE" });
}
