"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations";
import { siteConfig } from "@/constants/site";

type FieldErrors = Partial<Record<keyof ContactFormValues, string>>;

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors duration-200 placeholder:text-lightColor/60 focus:border-shop_light_green";

/**
 * Contact form with client-side validation. There is no message backend yet,
 * so a valid submission opens the visitor's email app with a pre-filled
 * message addressed to the pharmacy (email placeholder in constants/site.ts).
 */
const ContactForm = () => {
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

    const result = contactFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ContactFormValues;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    const { name, email, phone, subject, message } = result.data;
    const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`;
    window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-sm font-medium text-darkColor"
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={Boolean(errors.name)}
            className={inputClasses}
          />
          {errors.name && (
            <p role="alert" className="mt-1 text-xs text-shop_orange">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="contact-phone"
            className="mb-1.5 block text-sm font-medium text-darkColor"
          >
            Phone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="03XX XXXXXXX"
            aria-invalid={Boolean(errors.phone)}
            className={inputClasses}
          />
          {errors.phone && (
            <p role="alert" className="mt-1 text-xs text-shop_orange">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1.5 block text-sm font-medium text-darkColor"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          className={inputClasses}
        />
        {errors.email && (
          <p role="alert" className="mt-1 text-xs text-shop_orange">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1.5 block text-sm font-medium text-darkColor"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          placeholder="How can we help?"
          aria-invalid={Boolean(errors.subject)}
          className={inputClasses}
        />
        {errors.subject && (
          <p role="alert" className="mt-1 text-xs text-shop_orange">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm font-medium text-darkColor"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Write your message..."
          aria-invalid={Boolean(errors.message)}
          className={inputClasses}
        />
        {errors.message && (
          <p role="alert" className="mt-1 text-xs text-shop_orange">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-shop_btn_dark_green px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
      >
        <Send className="h-4 w-4" aria-hidden />
        Send Message
      </button>

      {submitted && (
        <p role="status" className="text-sm text-shop_light_green">
          Your email app should open with the message pre-filled. If it
          doesn&apos;t, please email us directly at {siteConfig.contact.email}.
        </p>
      )}
    </form>
  );
};

export default ContactForm;
