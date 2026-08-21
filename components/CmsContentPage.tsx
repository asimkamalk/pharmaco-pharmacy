import type { Metadata } from "next";
import Container from "@/components/Container";
import { getCmsPage, getSiteConfig } from "@/lib/site";
import { sanitizeProductHtml } from "@/lib/sanitize";

interface CmsContentPageProps {
  slug: "about" | "privacy" | "terms";
  fallbackTitle: string;
}

export async function buildCmsMetadata(
  slug: "about" | "privacy" | "terms",
): Promise<Metadata> {
  const [site, page] = await Promise.all([
    getSiteConfig(),
    getCmsPage(slug),
  ]);
  return {
    title: page?.title || fallbackTitleFor(slug, site.name),
    description: `${page?.title || fallbackTitleFor(slug, site.name)} — ${site.name}, ${site.location.area}, ${site.location.city}.`,
  };
}

function fallbackTitleFor(slug: string, name: string) {
  if (slug === "about") return `About ${name}`;
  if (slug === "privacy") return "Privacy Policy";
  return "Terms & Conditions";
}

export async function CmsContentPage({
  slug,
  fallbackTitle,
}: CmsContentPageProps) {
  const [site, page] = await Promise.all([
    getSiteConfig(),
    getCmsPage(slug),
  ]);
  const title = page?.title || fallbackTitle;
  const html = sanitizeProductHtml(page?.bodyHtml || "");

  return (
    <main className="bg-gradient-to-b from-shop_light_bg to-white">
      <Container className="py-10 sm:py-12">
        <p className="text-sm font-medium text-shop_light_green">
          {site.name}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-darkColor">{title}</h1>
        {html ? (
          <div
            className="product-prose mt-6 max-w-3xl"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="mt-6 max-w-2xl text-sm text-lightColor">
            Content for this page can be edited in the admin panel under Pages.
          </p>
        )}
      </Container>
    </main>
  );
}
