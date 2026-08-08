import { proxyToBackend } from "@/lib/admin-proxy";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, `/api/admin/enquiries/${id}`, { method: "PATCH" });
}
