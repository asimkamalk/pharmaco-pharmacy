import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPkDate } from "@/lib/datetime";

export const metadata = { title: "Pages · Admin" };

const slugs = [
  { slug: "about", label: "About" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms & Conditions" },
];

const AdminPagesIndex = async () => {
  const pages = await prisma.cmsPage.findMany();
  const bySlug = Object.fromEntries(pages.map((page) => [page.slug, page]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-darkColor">Content pages</h1>
        <p className="text-sm text-lightColor">
          Edit About, Privacy and Terms with the rich text editor
        </p>
      </div>

      <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        {slugs.map((item) => {
          const page = bySlug[item.slug];
          return (
            <li
              key={item.slug}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="font-semibold text-darkColor">{item.label}</p>
                <p className="text-xs text-lightColor">
                  /{item.slug}
                  {page
                    ? ` · ${page.isPublished ? "Published" : "Draft"} · updated ${formatPkDate(page.updatedAt)}`
                    : " · Not created yet"}
                </p>
              </div>
              <Link
                href={`/admin/pages/${item.slug}`}
                className="rounded-lg bg-shop_btn_dark_green px-4 py-2 text-sm font-semibold text-white"
              >
                Edit
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AdminPagesIndex;
