import type { Metadata } from "next";
import {
  buildCmsMetadata,
  CmsContentPage,
} from "@/components/CmsContentPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMetadata("terms");
}

const TermsPage = () => (
  <CmsContentPage slug="terms" fallbackTitle="Terms & Conditions" />
);

export default TermsPage;
