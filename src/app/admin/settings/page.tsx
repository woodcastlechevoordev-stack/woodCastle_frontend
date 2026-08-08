"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function disable2fa() {
    setMsg("");
    const res = await fetch("/api/admin/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable", password }),
    });
    const data = await res.json();
    setMsg(res.ok ? "2FA disabled" : data.error || "Failed");
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl text-brown-dark">Settings</h1>
      <p className="mt-1 text-brown-mid">Account security</p>

      <section className="mt-8 rounded-xl border border-brown-light bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl text-brown-dark">Two-factor authentication</h2>
        <p className="mt-2 text-sm text-brown-mid">
          Protect the admin panel with Google Authenticator.
        </p>
        <Link href="/admin/2fa-setup" className="mt-4 inline-block">
          <Button variant="outline">Set up 2FA</Button>
        </Link>

        <div className="mt-6 border-t border-brown-light pt-6 space-y-3">
          <p className="text-sm font-medium text-brown-dark">Disable 2FA</p>
          <Input
            id="disable-password"
            label="Confirm password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={disable2fa}>
            Disable 2FA
          </Button>
          {msg && <p className="text-sm text-brown-mid">{msg}</p>}
        </div>
      </section>
    </div>
  );
}
