import Image from "next/image";
import Link from "next/link";
import AdminFlash from "@/components/admin/AdminFlash";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { deleteHeroSlide, saveHeroSlide } from "@/lib/actions/hero";
import { getAllHeroSlidesAdmin } from "@/lib/hero";
import { ensureSiteSettings } from "@/lib/site";

export const metadata = { title: "Hero · Admin" };

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

interface PageProps {
  searchParams: Promise<{ saved?: string; edit?: string; error?: string }>;
}

const AdminHeroPage = async ({ searchParams }: PageProps) => {
  const { saved, edit, error } = await searchParams;
  await ensureSiteSettings();
  const slides = await getAllHeroSlidesAdmin();
  const editing = edit ? slides.find((slide) => slide.id === edit) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-darkColor">Hero slider</h1>
          <p className="text-sm text-lightColor">
            Full-bleed image slides with overlay text, buttons, arrows and
            progress — like a campaign banner carousel
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          View storefront →
        </Link>
      </div>

      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Hero slides saved."
      />

      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 font-semibold text-darkColor">
          {editing ? "Edit slide" : "Add slide"}
        </h2>
        <form action={saveHeroSlide} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <ImageUploadField
            name="background"
            urlFieldName="backgroundUrl"
            existingUrl={editing?.backgroundUrl ?? ""}
            label="Background image (required)"
            required
            requiredMessage="Please upload a background image for this slide"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Eyebrow (small uppercase label)</span>
              <input
                name="eyebrow"
                defaultValue={editing?.eyebrow ?? ""}
                placeholder="Pharmaco Pharmacy — Hayatabad"
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Headline</span>
              <input
                name="headline"
                required
                defaultValue={
                  editing?.headline ?? "Your health, delivered with care"
                }
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Supporting text</span>
              <textarea
                name="subcopy"
                rows={3}
                defaultValue={editing?.subcopy ?? ""}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Primary button label</span>
              <input
                name="ctaLabel"
                defaultValue={editing?.ctaLabel ?? "Shop now"}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Primary button link</span>
              <input
                name="ctaHref"
                defaultValue={editing?.ctaHref ?? "/shop"}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Secondary button label (optional)</span>
              <input
                name="ctaSecondaryLabel"
                defaultValue={editing?.ctaSecondaryLabel ?? ""}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Secondary button link</span>
              <input
                name="ctaSecondaryHref"
                defaultValue={editing?.ctaSecondaryHref ?? ""}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Sort order</span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={editing?.sortOrder ?? slides.length}
                className={field}
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={editing?.isActive ?? true}
              />
              Active (show on homepage)
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-shop_btn_dark_green px-5 py-2.5 text-sm font-semibold text-white"
            >
              {editing ? "Update slide" : "Add slide"}
            </button>
            {editing && (
              <Link
                href="/admin/hero"
                className="rounded-lg border border-black/15 px-5 py-2.5 text-sm font-semibold text-darkColor"
              >
                Cancel
              </Link>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-darkColor">
          Current slides ({slides.length})
        </h2>
        {slides.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/15 bg-white p-6 text-sm text-lightColor">
            No slides yet. Add your first full-bleed background image above.
          </p>
        )}
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-shop_light_bg sm:h-20 sm:w-36">
              <Image
                src={slide.backgroundUrl}
                alt=""
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-darkColor">{slide.headline}</p>
              <p className="truncate text-xs text-lightColor">
                #{slide.sortOrder} · {slide.isActive ? "Active" : "Hidden"} ·{" "}
                {slide.eyebrow || "No eyebrow"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/hero?edit=${slide.id}`}
                className="rounded-lg border border-black/15 px-3 py-2 text-sm font-medium text-darkColor hover:border-shop_light_green"
              >
                Edit
              </Link>
              <form action={deleteHeroSlide}>
                <input type="hidden" name="id" value={slide.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-shop_orange/30 px-3 py-2 text-sm font-medium text-shop_orange hover:bg-shop_orange/5"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHeroPage;
