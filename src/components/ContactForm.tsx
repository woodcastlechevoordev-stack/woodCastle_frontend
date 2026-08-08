"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { contactSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Values = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [done, setDone] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: Values) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-brown-light bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-gold" size={40} />
        <h3 className="mt-3 font-heading text-xl text-brown-dark">Message received</h3>
        <p className="mt-2 text-sm text-brown-mid">
          We&apos;ll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-brown-light bg-white p-6 shadow-sm"
    >
      <Input
        id="contact-name"
        label="Name"
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />
      <Input
        id="contact-email"
        label="Email"
        type="email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <Input
        id="contact-phone"
        label="Phone"
        type="tel"
        error={form.formState.errors.phone?.message}
        {...form.register("phone")}
      />
      <Textarea
        id="contact-message"
        label="Message"
        error={form.formState.errors.message?.message}
        {...form.register("message")}
      />
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
