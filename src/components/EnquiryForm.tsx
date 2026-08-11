"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { siteInfo } from "@/lib/api";
import { enquirySchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type EnquiryValues = z.infer<typeof enquirySchema>;

export function EnquiryForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [success, setSuccess] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
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

      const link =
        typeof data.whatsappLink === "string" ? data.whatsappLink : null;
      if (link) {
        const opened = window.open(link, "_blank");
        setWhatsappOpened(Boolean(opened));
      } else {
        setWhatsappOpened(false);
      }

      setSuccess(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-brown-light bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-gold" size={40} />
        <h3 className="mt-3 font-heading text-xl text-brown-dark">
          Enquiry received!
        </h3>
        <p className="mt-2 text-sm text-brown-mid">
          {whatsappOpened
            ? "We've opened WhatsApp for you — just hit send to reach our team."
            : "Your enquiry is saved. If WhatsApp didn't open, use the number below to reach us."}
        </p>
        <p className="mt-4 text-sm text-brown-mid">
          Prefer to call or text directly?{" "}
          <a
            href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}
            className="font-semibold text-gold hover:underline"
          >
            {siteInfo.phone}
          </a>
        </p>
        <a
          href={`https://wa.me/${siteInfo.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-gold hover:underline"
        >
          Open WhatsApp manually
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brown-light bg-white p-6 shadow-sm">
      <h3 className="font-heading text-xl text-brown-dark">Enquire Now</h3>
      <p className="mt-1 text-sm text-brown-mid">
        Share your details — we&apos;ll open WhatsApp with your message ready to
        send.
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
