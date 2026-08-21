"use client";

import { saveCmsPage } from "@/lib/actions/settings";
import RichTextEditor from "@/components/admin/RichTextEditor";

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

interface CmsPageFormProps {
  slug: string;
  title: string;
  bodyHtml: string;
  isPublished: boolean;
}

const CmsPageForm = ({
  slug,
  title,
  bodyHtml,
  isPublished,
}: CmsPageFormProps) => {
  return (
    <form action={saveCmsPage} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">Title</span>
        <input name="title" required defaultValue={title} className={field} />
      </label>
      <RichTextEditor
        name="bodyHtml"
        label="Page content"
        defaultValue={bodyHtml}
        placeholder="Write page content…"
      />
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={isPublished} />
        Published
      </label>
      <button
        type="submit"
        className="rounded-lg bg-shop_btn_dark_green px-5 py-2.5 text-sm font-semibold text-white"
      >
        Save page
      </button>
    </form>
  );
};

export default CmsPageForm;
