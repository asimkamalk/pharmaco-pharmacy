import type { Metadata } from "next";
import Container from "@/components/Container";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for ${siteConfig.name}, ${siteConfig.location.area}, ${siteConfig.location.city}.`,
};

const TermsPage = () => {
  return (
    <Container className="py-12">
      <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
        Terms &amp; Conditions
      </h1>
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-lightColor">
        <p>
          This page is a placeholder for the {siteConfig.name} terms and
          conditions. Replace this content with your finalised terms before
          going live.
        </p>
        <p>
          The terms should cover ordering, payment (including Cash on
          Delivery), delivery areas and timelines, returns and refunds, and the
          handling of prescription-required medicines.
        </p>
      </div>
    </Container>
  );
};

export default TermsPage;
