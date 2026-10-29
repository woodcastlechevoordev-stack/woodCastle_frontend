"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { passwordChangeSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type PasswordValues = z.infer<typeof passwordChangeSchema>;

export default function AdminSettingsPage() {
  const [disablePassword, setDisablePassword] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onChangePassword(values: PasswordValues) {
    setPasswordMsg("");
    setPasswordError("");
    const res = await fetch("/api/admin/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPasswordError(data.error || "Failed to update password");
      return;
    }
    passwordForm.reset();
    setPasswordMsg("Password updated. Use the new password the next time you sign in.");
  }

  async function disable2fa() {
    setTwoFaMsg("");
    const res = await fetch("/api/admin/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable", password: disablePassword }),
    });
    const data = await res.json();
    setTwoFaMsg(res.ok ? "2FA disabled" : data.error || "Failed");
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl text-brown-dark">Settings</h1>
      <p className="mt-1 text-brown-mid">Account security</p>

      <section className="mt-8 rounded-xl border border-brown-light bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl text-brown-dark">Change password</h2>
        <p className="mt-2 text-sm text-brown-mid">
          Use a long password that is not shared anywhere else.
        </p>
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="mt-5 space-y-4"
        >
          <Input
            id="current-password"
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register("currentPassword")}
          />
          <Input
            id="new-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword")}
          />
          <Input
            id="confirm-password"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register("confirmPassword")}
          />
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordMsg && <p className="text-sm text-brown-mid">{passwordMsg}</p>}
          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-brown-light bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl text-brown-dark">Two-factor authentication</h2>
        <p className="mt-2 text-sm text-brown-mid">
          Protect the admin panel with Google Authenticator.
        </p>
        <Link href="/admin/2fa-setup" className="mt-4 inline-block">
          <Button variant="outline">Set up 2FA</Button>
        </Link>

        <div className="mt-6 space-y-3 border-t border-brown-light pt-6">
          <p className="text-sm font-medium text-brown-dark">Disable 2FA</p>
          <Input
            id="disable-password"
            label="Confirm password"
            type="password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={disable2fa}>
            Disable 2FA
          </Button>
          {twoFaMsg && <p className="text-sm text-brown-mid">{twoFaMsg}</p>}
        </div>
      </section>
    </div>
  );
}
