"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { brand } from "@/lib/brand";
import { loginSchema, totpSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
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
    <div className="grid min-h-[100dvh] bg-cream lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brown-dark text-cream lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12 xl:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Woodcastle
          </p>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-heading text-5xl leading-[1.1] tracking-tight text-cream">
            Studio
            <br />
            access
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/70">
            {brand.legacyLine}
          </p>
        </div>
        <p className="relative text-[11px] uppercase tracking-[0.2em] text-cream/40">
          {brand.establishedYear} · {brand.locationShort}
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-[400px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold lg:hidden">
            Woodcastle
          </p>
          <h1 className="mt-5 font-heading text-3xl tracking-tight text-brown-dark sm:text-4xl lg:mt-0">
            {step === "credentials" ? "Sign in" : "Verify"}
          </h1>
          <p className="mt-2 text-sm text-brown-mid">
            {step === "credentials"
              ? "Use your admin username and password."
              : "Enter the 6-digit authenticator code."}
          </p>

          {step === "credentials" ? (
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="mt-10 space-y-5"
            >
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
              <Button
                type="submit"
                className="mt-1 h-12 w-full"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? "Signing in…" : "Continue"}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={totpForm.handleSubmit(onTotp)}
              className="mt-10 space-y-5"
            >
              <Input
                id="totp"
                label="Authenticator code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                error={totpForm.formState.errors.code?.message}
                {...totpForm.register("code")}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="mt-1 h-12 w-full">
                Continue
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="w-full text-center text-sm text-brown-mid transition-colors hover:text-brown-dark"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </main>
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
