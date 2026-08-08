"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import { useState } from "react";

export default function TwoFactorSetupPage() {
  const [code, setCode] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function setup() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");
      setQrDataUrl(data.qrCodeDataUrl || data.qrDataUrl || data.qrCode || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    setError("");
    const res = await fetch("/api/admin/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable", code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setEnabled(true);
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-heading text-3xl text-brown-dark">Set up 2FA</h1>
      <p className="mt-2 text-brown-mid">
        Generate a QR code, scan it with Google Authenticator, then confirm with a code.
      </p>

      <div className="mt-8 rounded-xl border border-brown-light bg-white p-6 shadow-sm">
        {!qrDataUrl ? (
          <Button type="button" variant="gold" onClick={setup} disabled={loading}>
            {loading ? "Generating…" : "Generate QR code"}
          </Button>
        ) : (
          <div className="mx-auto relative h-48 w-48">
            <Image src={qrDataUrl} alt="2FA QR code" fill className="object-contain" unoptimized />
          </div>
        )}

        {enabled ? (
          <p className="mt-6 text-center font-medium text-gold">
            Two-factor authentication enabled.
          </p>
        ) : (
          qrDataUrl && (
            <div className="mt-6 space-y-4">
              <Input
                id="confirm-code"
                label="Confirmation code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                inputMode="numeric"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="button" onClick={confirm} className="w-full">
                Confirm & Enable
              </Button>
            </div>
          )
        )}
        {error && !qrDataUrl && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
