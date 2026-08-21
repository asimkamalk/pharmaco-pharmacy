import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";
import GoogleMap from "@/components/GoogleMap";
import { getSiteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: "Contact Us",
    description: `Get in touch with ${site.name} in ${site.location.area}, ${site.location.city} — phone, WhatsApp, email and store location.`,
  };
}

const ContactPage = async () => {
  const siteConfig = await getSiteConfig();
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

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {contactDetails.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-xl border border-black/10 bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shop_light_pink">
                  <item.icon className="h-4 w-4 text-shop_dark_green" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-darkColor">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-lightColor">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-darkColor">
              Send a message
            </h2>
            <ContactForm />
          </div>
        </div>

        <div className="mt-10">
          <GoogleMap />
        </div>
      </Container>
    </main>
  );
};

export default ContactPage;
