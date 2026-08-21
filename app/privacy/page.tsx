import type { Metadata } from "next";
import {
  buildCmsMetadata,
  CmsContentPage,
} from "@/components/CmsContentPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMetadata("privacy");
}

const PrivacyPage = () => (
  <CmsContentPage slug="privacy" fallbackTitle="Privacy Policy" />
);

export default PrivacyPage;
