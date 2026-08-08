import { proxyToBackend } from "@/lib/admin-proxy";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/api/admin/products");
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/api/admin/products");
}
