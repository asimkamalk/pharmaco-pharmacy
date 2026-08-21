import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";
import GoogleMap from "@/components/GoogleMap";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.name} in ${siteConfig.location.area}, ${siteConfig.location.city} — phone, WhatsApp, email and store location.`,
};

const contactDetails = [
  {
    icon: MapPin,
    title: "Visit Us",
    value: siteConfig.location.address,
  },
  {
    icon: Phone,
    title: "Call Us",
    value: siteConfig.contact.phone,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: siteConfig.contact.whatsapp,
  },
  {
    icon: Mail,
    title: "Email",
    value: siteConfig.contact.email,
  },
  {
    icon: Clock,
    title: "Opening Hours",
    value: siteConfig.contact.openingHours,
  },
];

const ContactPage = () => {
  return (
    <main className="bg-white">
      <Container className="py-8 sm:py-10">
        <header className="max-w-2xl">
          <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
            Contact Us
          </h1>
          <p className="mt-1.5 text-sm text-lightColor">
            Questions about a product or your order? Reach out — we&apos;re
            happy to help.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {contactDetails.map((detail) => (
              <div
                key={detail.title}
                className="flex items-start gap-3.5 rounded-xl border border-black/10 bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shop_light_pink">
                  <detail.icon
                    className="h-4.5 w-4.5 text-shop_dark_green"
                    aria-hidden
                  />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-darkColor">
                    {detail.title}
                  </h2>
                  <p className="mt-0.5 break-words text-sm text-lightColor">
                    {detail.value}
                  </p>
                </div>
              </div>
            ))}

            <GoogleMap className="mt-2" title="Our location" />
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
            <h2 className="mb-5 text-lg font-semibold text-darkColor">
              Send us a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </Container>
    </main>
  );
};

export default ContactPage;
