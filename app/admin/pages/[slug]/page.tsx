import Link from "next/link";
import { notFound } from "next/navigation";
import CmsPageForm from "@/components/admin/CmsPageForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit Page · Admin" };

const titles: Record<string, string> = {
  about: "About",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}

const AdminCmsPageEdit = async ({ params, searchParams }: PageProps) => {
  const { slug } = await params;
  const { saved } = await searchParams;
  if (!titles[slug]) notFound();

  const page = await prisma.cmsPage.findUnique({ where: { slug } });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/pages"
            className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
          >
            ← All pages
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-darkColor">
            Edit {titles[slug]}
          </h1>
        </div>
      </div>

      {saved && (
        <p className="rounded-lg border border-shop_light_green/30 bg-shop_light_green/10 px-4 py-2 text-sm text-shop_dark_green">
          Page saved.
        </p>
      )}

      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <CmsPageForm
          slug={slug}
          title={page?.title || titles[slug]}
          bodyHtml={page?.bodyHtml || ""}
          isPublished={page?.isPublished ?? true}
        />
      </div>
    </div>
  );
};

export default AdminCmsPageEdit;
