"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { enquirySchema, otpSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Step = "form" | "otp" | "success";
type EnquiryValues = z.infer<typeof enquirySchema>;
type OtpValues = z.infer<typeof otpSchema>;

export function EnquiryForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [step, setStep] = useState<Step>("form");
  const [phone, setPhone] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");

  const enquiryForm = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      message: `I'd like to enquire about ${productName}.`,
      productId,
    },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { phone: "", code: "" },
  });

  async function onEnquirySubmit(values: EnquiryValues) {
    setServerError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit enquiry");

      setPhone(values.phone);
      otpForm.setValue("phone", values.phone);

      if (data.requiresPhoneVerification === false) {
        setStep("success");
        return;
      }

      const otpRes = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: values.phone }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.error || "Failed to send OTP");

      if (otpData.debugOtp) setDebugOtp(String(otpData.debugOtp));
      setStep("otp");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function onOtpSubmit(values: OtpValues) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setStep("success");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Verification failed");
    }
  }

  if (step === "success") {
    return (
      <div className="rounded-xl border border-brown-light bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-gold" size={40} />
        <h3 className="mt-3 font-heading text-xl text-brown-dark">Enquiry sent!</h3>
        <p className="mt-2 text-sm text-brown-mid">
          Our team will reach out on WhatsApp shortly.
        </p>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="rounded-xl border border-brown-light bg-white p-6 shadow-sm">
        <h3 className="font-heading text-xl text-brown-dark">Verify your number</h3>
        <p className="mt-2 text-sm text-brown-mid">
          We&apos;ve sent a code to verify your number ending in{" "}
          <span className="font-medium text-brown-dark">{phone.slice(-4)}</span>.
        </p>
        {debugOtp && (
          <p className="mt-2 text-sm text-gold">
            Dev OTP: <span className="font-semibold">{debugOtp}</span>
          </p>
        )}
        <form
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
          className="mt-5 space-y-4"
        >
          <Input
            id="otp-code"
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            error={otpForm.formState.errors.code?.message}
            {...otpForm.register("code")}
          />
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
            {otpForm.formState.isSubmitting ? "Verifying…" : "Verify & Complete"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brown-light bg-white p-6 shadow-sm">
      <h3 className="font-heading text-xl text-brown-dark">Enquire Now</h3>
      <p className="mt-1 text-sm text-brown-mid">
        Share your details — we&apos;ll confirm on WhatsApp.
      </p>
      <form
        onSubmit={enquiryForm.handleSubmit(onEnquirySubmit)}
        className="mt-5 space-y-4"
      >
        <input type="hidden" {...enquiryForm.register("productId")} />
        <Input
          id="enquiry-name"
          label="Your name"
          autoComplete="name"
          error={enquiryForm.formState.errors.name?.message}
          {...enquiryForm.register("name")}
        />
        <Input
          id="enquiry-phone"
          label="Phone / WhatsApp"
          type="tel"
          autoComplete="tel"
          error={enquiryForm.formState.errors.phone?.message}
          {...enquiryForm.register("phone")}
        />
        <Textarea
          id="enquiry-message"
          label="Message"
          error={enquiryForm.formState.errors.message?.message}
          {...enquiryForm.register("message")}
        />
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button
          type="submit"
          variant="gold"
          className="w-full"
          disabled={enquiryForm.formState.isSubmitting}
        >
          {enquiryForm.formState.isSubmitting ? "Sending…" : "Send Enquiry"}
        </Button>
      </form>
    </div>
  );
}
