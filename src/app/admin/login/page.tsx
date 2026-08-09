"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginSchema, totpSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;
type TotpValues = z.infer<typeof totpSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [tempToken, setTempToken] = useState("");
  const [error, setError] = useState("");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const totpForm = useForm<TotpValues>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: "" },
  });

  async function onLogin(values: LoginValues) {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    if (data.requires2fa) {
      setTempToken(data.tempToken);
      setStep("totp");
      return;
    }
    router.push(searchParams.get("from") || "/admin");
    router.refresh();
  }

  async function onTotp(values: TotpValues) {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "totp",
        tempToken,
        code: values.code,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Invalid code");
      return;
    }
    router.push(searchParams.get("from") || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-xl border border-brown-light bg-white p-8 shadow-sm">
        <div className="text-center">
          <Image
            src="/brand/logo.png"
            alt="Woodcastle Furniture"
            width={865}
            height={479}
            priority
            className="mx-auto h-16 w-auto object-contain sm:h-20"
          />
          <p className="mt-4 text-sm font-medium uppercase tracking-widest text-brown-mid">
            Admin Panel
          </p>
          <div className="section-divider mx-auto mt-5 max-w-[120px]" />
        </div>

        {step === "credentials" ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="mt-8 space-y-4">
            <Input
              id="username"
              label="Username"
              autoComplete="username"
              error={loginForm.formState.errors.username?.message}
              {...loginForm.register("username")}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={loginForm.formState.errors.password?.message}
              {...loginForm.register("password")}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
              {loginForm.formState.isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
            <p className="text-center text-xs text-brown-light">
              Default: admin / admin123
            </p>
          </form>
        ) : (
          <form onSubmit={totpForm.handleSubmit(onTotp)} className="mt-8 space-y-4">
            <p className="text-sm text-brown-mid">
              Enter the 6-digit code from Google Authenticator.
            </p>
            <Input
              id="totp"
              label="Authenticator code"
              inputMode="numeric"
              maxLength={6}
              error={totpForm.formState.errors.code?.message}
              {...totpForm.register("code")}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              Verify
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
