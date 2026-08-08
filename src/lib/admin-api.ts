import { cookies } from "next/headers";
import { backendFetch } from "./backend";

export async function getAdminToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("admin_token")?.value ?? null;
}

export async function adminBackendFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAdminToken();
  if (!token) {
    throw new Error("Unauthorized");
  }
  return backendFetch<T>(path, { ...options, token, cache: "no-store" });
}
