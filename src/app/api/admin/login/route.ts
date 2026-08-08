import { backendFetch } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step, tempToken, code, username, password } = body as {
      step?: string;
      tempToken?: string;
      code?: string;
      username?: string;
      password?: string;
    };

    if (step === "totp") {
      const data = await backendFetch<{
        token: string;
        admin: unknown;
      }>("/api/admin/login/verify-totp", {
        method: "POST",
        body: JSON.stringify({ tempToken, code }),
      });

      const res = NextResponse.json({ success: true, admin: data.admin });
      res.cookies.set("admin_token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      return res;
    }

    const data = await backendFetch<{
      requiresTotp?: boolean;
      tempToken?: string;
      token?: string;
      admin?: unknown;
    }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (data.requiresTotp) {
      return NextResponse.json({
        requires2fa: true,
        tempToken: data.tempToken,
      });
    }

    if (!data.token) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, admin: data.admin });
    res.cookies.set("admin_token", data.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
