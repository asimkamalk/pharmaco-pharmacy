import type { Metadata } from "next";
import {
  buildCmsMetadata,
  CmsContentPage,
} from "@/components/CmsContentPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMetadata("about");
}

const AboutPage = () => (
  <CmsContentPage slug="about" fallbackTitle="About" />
);

export default AboutPage;
