import Link from "next/link";
import AdminFlash from "@/components/admin/AdminFlash";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { saveSiteSettings } from "@/lib/actions/settings";
import { ensureSiteSettings, mapSettingsToConfig } from "@/lib/site";

export const metadata = { title: "Site Settings · Admin" };

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

interface PageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const AdminSettingsPage = async ({ searchParams }: PageProps) => {
  const { saved, error } = await searchParams;
  const row = await ensureSiteSettings();
  const site = mapSettingsToConfig(row);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-darkColor">Site settings</h1>
          <p className="text-sm text-lightColor">
            Business details, delivery, payments, map and SEO — used across the
            whole storefront
          </p>
        </div>
        <Link
          href="/admin/homepage"
          className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          Edit homepage →
        </Link>
      </div>

      <AdminFlash saved={saved} error={error} savedMessage="Settings saved." />

      <form
        action={saveSiteSettings}
        className="space-y-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6"
      >
        <section className="space-y-3">
          <h2 className="font-semibold text-darkColor">Identity</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Pharmacy name</span>
              <input
                name="name"
                required
                defaultValue={site.name}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Short name</span>
              <input
                name="shortName"
                defaultValue={site.shortName}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Tagline</span>
              <input
                name="tagline"
                defaultValue={site.tagline}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>About / description</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={site.description}
                className={field}
              />
            </label>
          </div>
          <ImageUploadField
            name="logo"
            existingUrl={site.branding.logoUrl}
            label="Logo"
          />
          <input type="hidden" name="logoUrl" value={site.branding.logoUrl} />
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-darkColor">Location & contact</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                ["address", "Address", site.location.address],
                ["area", "Area", site.location.area],
                ["city", "City", site.location.city],
                ["country", "Country", site.location.country],
                ["phone", "Phone", site.contact.phone],
                ["whatsapp", "WhatsApp", site.contact.whatsapp],
                ["email", "Email", site.contact.email],
                ["openingHours", "Opening hours (e.g. Open 24/7 · Mon–Sun)", site.contact.openingHours],
              ] as const
            ).map(([name, label, value]) => (
              <label key={name} className="space-y-1 text-sm">
                <span>{label}</span>
                <input
                  name={name}
                  required={name === "phone" || name === "email"}
                  defaultValue={value}
                  className={field}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-darkColor">Delivery</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Standard fee (PKR)</span>
              <input
                name="deliveryStandardFee"
                type="number"
                defaultValue={site.delivery.standardFee}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Free delivery above (PKR)</span>
              <input
                name="freeDeliveryAbove"
                type="number"
                defaultValue={site.delivery.freeDeliveryAbove}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Delivery estimate (e.g. 24/7 Mon–Sun)</span>
              <input
                name="deliveryEstimate"
                defaultValue={site.delivery.estimate}
                className={field}
              />
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-darkColor">Payments</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                ["bankName", "Bank name", site.payments.bankTransfer.bankName],
                [
                  "bankAccountTitle",
                  "Bank account title",
                  site.payments.bankTransfer.accountTitle,
                ],
                [
                  "bankAccountNumber",
                  "Account number",
                  site.payments.bankTransfer.accountNumber,
                ],
                ["bankIban", "IBAN", site.payments.bankTransfer.iban],
                [
                  "easyPaisaTitle",
                  "EasyPaisa title",
                  site.payments.easyPaisa.accountTitle,
                ],
                [
                  "easyPaisaNumber",
                  "EasyPaisa number",
                  site.payments.easyPaisa.mobileNumber,
                ],
                [
                  "jazzCashTitle",
                  "JazzCash title",
                  site.payments.jazzCash.accountTitle,
                ],
                [
                  "jazzCashNumber",
                  "JazzCash number",
                  site.payments.jazzCash.mobileNumber,
                ],
              ] as const
            ).map(([name, label, value]) => (
              <label key={name} className="space-y-1 text-sm">
                <span>{label}</span>
                <input name={name} defaultValue={value} className={field} />
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-darkColor">Map & social</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Map embed URL</span>
              <input
                name="mapEmbedUrl"
                defaultValue={site.map.embedUrl}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Map link URL</span>
              <input
                name="mapLinkUrl"
                defaultValue={site.map.linkUrl}
                className={field}
              />
            </label>
            {(
              [
                ["facebookUrl", "Facebook", site.social.facebook],
                ["instagramUrl", "Instagram", site.social.instagram],
                ["tiktokUrl", "TikTok", site.social.tiktok],
                ["twitterUrl", "Twitter / X", site.social.twitter],
              ] as const
            ).map(([name, label, value]) => (
              <label key={name} className="space-y-1 text-sm">
                <span>{label}</span>
                <input name={name} defaultValue={value} className={field} />
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-darkColor">SEO (site-wide)</h2>
          <p className="text-xs text-lightColor">
            Used for the homepage and pages without their own SEO fields.
            Product pages use each product&apos;s Meta title / Meta description
            (and product image) from Admin → Products.
          </p>
          <div className="grid gap-3">
            <label className="space-y-1 text-sm">
              <span>Default title</span>
              <input
                name="seoTitle"
                defaultValue={site.seo.title}
                maxLength={70}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Default description</span>
              <textarea
                name="seoDescription"
                rows={3}
                maxLength={160}
                defaultValue={site.seo.description}
                className={field}
              />
              <span className="text-xs text-lightColor">
                Recommended ~160 characters for Google search snippets.
              </span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          className="rounded-lg bg-shop_btn_dark_green px-5 py-2.5 text-sm font-semibold text-white"
        >
          Save settings
        </button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
