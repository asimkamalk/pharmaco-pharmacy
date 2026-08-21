"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations";
import { useSiteConfig } from "@/components/SiteConfigProvider";

type FieldErrors = Partial<Record<keyof ContactFormValues, string>>;

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors duration-200 placeholder:text-lightColor/60 focus:border-shop_light_green";

const ContactForm = () => {
  const siteConfig = useSiteConfig();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactFormValues;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitted(true);
    window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
      parsed.data.subject,
    )}&body=${encodeURIComponent(
      `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nPhone: ${parsed.data.phone}\n\n${parsed.data.message}`,
    )}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">Name</span>
          <input name="name" className={inputClasses} />
          {errors.name && (
            <p className="text-xs text-shop_orange">{errors.name}</p>
          )}
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">Email</span>
          <input name="email" type="email" className={inputClasses} />
          {errors.email && (
            <p className="text-xs text-shop_orange">{errors.email}</p>
          )}
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">Phone</span>
        <input name="phone" className={inputClasses} />
        {errors.phone && (
          <p className="text-xs text-shop_orange">{errors.phone}</p>
        )}
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">Subject</span>
        <input name="subject" className={inputClasses} />
        {errors.subject && (
          <p className="text-xs text-shop_orange">{errors.subject}</p>
        )}
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">Message</span>
        <textarea name="message" rows={5} className={inputClasses} />
        {errors.message && (
          <p className="text-xs text-shop_orange">{errors.message}</p>
        )}
      </label>
      <button
        type="submit"
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-shop_btn_dark_green px-5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
      >
        <Send className="h-4 w-4" />
        Send message
      </button>
      {submitted && (
        <p className="text-sm text-shop_dark_green">
          Opening your email app… If it doesn&apos;t, please email us directly
          at {siteConfig.contact.email}.
        </p>
      )}
    </form>
  );
};

export default ContactForm;
