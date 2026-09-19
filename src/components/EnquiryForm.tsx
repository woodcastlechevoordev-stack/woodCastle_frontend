"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { siteInfo } from "@/lib/api";
import { enquirySchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type EnquiryValues = z.infer<typeof enquirySchema>;

function buildEnquiryWhatsAppLink(values: EnquiryValues, productName: string) {
  const text = [
    `New enquiry from ${values.name}`,
    `Phone: ${values.phone}`,
    `Product: ${productName}`,
    "",
    values.message,
  ].join("\n");
  return `https://wa.me/${siteInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function EnquiryForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [success, setSuccess] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [whatsappHref, setWhatsappHref] = useState(
    `https://wa.me/${siteInfo.whatsapp}`
  );
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
    const fallbackLink = buildEnquiryWhatsAppLink(values, productName);
    // Open while the click is still a user gesture so popup blockers don't stop WhatsApp.
    const popup = window.open("about:blank", "_blank");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit enquiry");

      const link =
        typeof data.whatsappLink === "string" && data.whatsappLink
          ? data.whatsappLink
          : fallbackLink;

      setWhatsappHref(link);

      if (popup && !popup.closed) {
        popup.location.href = link;
        setWhatsappOpened(true);
      } else {
        popup?.close();
        setWhatsappOpened(false);
      }

      setSuccess(true);
    } catch (e) {
      popup?.close();
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-brown-light/60 bg-white px-5 py-8 text-center shadow-sm sm:px-8 sm:py-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
          <CheckCircle2 className="text-gold" size={28} aria-hidden />
        </div>
        <h3 className="mt-5 font-heading text-2xl text-brown-dark">
          Enquiry Received!
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-brown-mid">
          {whatsappOpened
            ? "We've opened WhatsApp for you — just hit send to reach our team."
            : "Your enquiry is saved. If WhatsApp didn't open, use the options below to reach us."}
        </p>

        <div className="mx-auto mt-7 max-w-xs border-t border-brown-light/50 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brown-light">
            Prefer to call or message?
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <a
              href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-lg border border-brown-light bg-cream text-sm font-semibold text-brown-dark transition-colors hover:border-gold hover:text-gold"
            >
              <Phone size={18} aria-hidden />
              Call {siteInfo.phone}
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-lg bg-[#25D366] text-sm font-semibold text-white transition-colors hover:bg-[#1ebe57]"
            >
              <WhatsAppIcon size={18} />
              Open WhatsApp
            </a>
          </div>
        </div>
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
