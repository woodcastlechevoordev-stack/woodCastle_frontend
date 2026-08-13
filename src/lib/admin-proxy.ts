import { getApiUrl } from "@/lib/backend";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function withForwardedQuery(req: NextRequest, backendPath: string): string {
  const [path, existing] = backendPath.split("?");
  const merged = new URLSearchParams(existing || "");
  req.nextUrl.searchParams.forEach((value, key) => {
    merged.set(key, value);
  });
  const qs = merged.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
  init?: RequestInit
) {
  try {
    const jar = await cookies();
    const token = jar.get("admin_token")?.value;

    const url = `${getApiUrl()}${withForwardedQuery(req, backendPath)}`;
    const hasBody =
      init?.body !== undefined || (req.method !== "GET" && req.method !== "HEAD");

    let body: string | undefined;
    if (hasBody && init?.body === undefined) {
      try {
        body = await req.text();
      } catch {
        body = undefined;
      }
    } else if (typeof init?.body === "string") {
      body = init.body;
    }

    const res = await fetch(url, {
      method: init?.method || req.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
      body: body || undefined,
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
    }

    return NextResponse.json(data ?? {}, { status: res.status });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Backend request failed";
    return NextResponse.json(
      {
        error: `Cannot reach API at ${getApiUrl()}. ${message}`,
      },
      { status: 502 }
    );
  }
}
