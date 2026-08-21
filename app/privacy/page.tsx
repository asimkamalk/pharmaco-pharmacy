import type { Metadata } from "next";
import Container from "@/components/Container";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}, ${siteConfig.location.area}, ${siteConfig.location.city}.`,
};

const PrivacyPage = () => {
  return (
    <Container className="py-12">
      <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
        Privacy Policy
      </h1>
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-lightColor">
        <p>
          This page is a placeholder for the {siteConfig.name} privacy policy.
          Replace this content with your finalised policy before going live.
        </p>
        <p>
          The policy should describe what personal information is collected
          (such as name, contact details and delivery address), how it is used
          to process orders, how it is stored and who it is shared with.
        </p>
      </div>
    </Container>
  );
};

export default PrivacyPage;
