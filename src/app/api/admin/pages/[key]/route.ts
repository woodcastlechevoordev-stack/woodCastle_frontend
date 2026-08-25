import { proxyToBackend } from "@/lib/admin-proxy";
import {
  STATIC_PAGE_PUBLIC_PATH,
  staticPageCacheTag,
} from "@/lib/static-pages";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ key: string }> };

function revalidatePublicPage(key: string) {
  const path = STATIC_PAGE_PUBLIC_PATH[key];
  if (path) revalidatePath(path);
  revalidateTag(staticPageCacheTag(key));
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  return proxyToBackend(req, `/api/admin/pages/${key}`, { method: "GET" });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  const res = await proxyToBackend(req, `/api/admin/pages/${key}`, {
    method: "PATCH",
  });
  if (res.ok) revalidatePublicPage(key);
  return res;
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  const res = await proxyToBackend(req, `/api/admin/pages/${key}`, {
    method: "PATCH",
  });
  if (res.ok) revalidatePublicPage(key);
  return res;
}
