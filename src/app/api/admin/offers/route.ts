import { proxyToBackend } from "@/lib/admin-proxy";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/api/admin/offers");
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/api/admin/offers");
}
