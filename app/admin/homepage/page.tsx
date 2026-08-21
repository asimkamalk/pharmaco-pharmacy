import AdminFlash from "@/components/admin/AdminFlash";
import { saveHomepageSettings } from "@/lib/actions/settings";
import { ensureSiteSettings, mapSettingsToConfig } from "@/lib/site";

export const metadata = { title: "Homepage · Admin" };

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

interface PageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const AdminHomepagePage = async ({ searchParams }: PageProps) => {
  const { saved, error } = await searchParams;
  const row = await ensureSiteSettings();
  const site = mapSettingsToConfig(row);
  const why = site.home.whyChoose;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-darkColor">Homepage content</h1>
        <p className="text-sm text-lightColor">
          Promo banner, Order by prescription, and “Why choose us” cards. Edit
          the hero under{" "}
          <a href="/admin/hero" className="font-medium text-shop_light_green">
            Hero
          </a>
          .
        </p>
      </div>

      <AdminFlash saved={saved} error={error} savedMessage="Homepage saved." />

      <form
        action={saveHomepageSettings}
        className="space-y-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6"
      >
        <section className="space-y-3">
          <h2 className="font-semibold text-darkColor">Promo strip</h2>
          <div className="grid gap-3">
            <label className="space-y-1 text-sm">
              <span>Promo headline</span>
              <input
                name="promoHeadline"
                defaultValue={site.home.promoHeadline}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Promo supporting text</span>
              <input
                name="promoSubcopy"
                defaultValue={site.home.promoSubcopy}
                className={field}
              />
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-darkColor">
            Order by prescription
          </h2>
          <p className="text-xs text-lightColor">
            Shown on the storefront homepage with a link to{" "}
            <code className="rounded bg-shop_light_bg px-1">
              /order-by-prescription
            </code>
            .
          </p>
          <div className="grid gap-3">
            <label className="space-y-1 text-sm">
              <span>Headline</span>
              <input
                name="rxOrderHeadline"
                defaultValue={site.home.rxOrderHeadline}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Supporting text</span>
              <textarea
                name="rxOrderSubcopy"
                rows={3}
                defaultValue={site.home.rxOrderSubcopy}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Step 1</span>
              <input
                name="rxOrderStep1"
                defaultValue={site.home.rxOrderSteps[0]}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Step 2</span>
              <input
                name="rxOrderStep2"
                defaultValue={site.home.rxOrderSteps[1]}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Step 3</span>
              <input
                name="rxOrderStep3"
                defaultValue={site.home.rxOrderSteps[2]}
                className={field}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Button label</span>
              <input
                name="rxOrderCtaLabel"
                defaultValue={site.home.rxOrderCtaLabel}
                className={field}
              />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-darkColor">Why choose us</h2>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-black/10 p-4 md:grid-cols-2"
            >
              <label className="space-y-1 text-sm">
                <span>Card {index + 1} title</span>
                <input
                  name={`whyTitle${index + 1}`}
                  defaultValue={why[index]?.title ?? ""}
                  className={field}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Card {index + 1} description</span>
                <input
                  name={`whyDescription${index + 1}`}
                  defaultValue={why[index]?.description ?? ""}
                  className={field}
                />
              </label>
            </div>
          ))}
        </section>

        <button
          type="submit"
          className="rounded-lg bg-shop_btn_dark_green px-5 py-2.5 text-sm font-semibold text-white"
        >
          Save homepage
        </button>
      </form>
    </div>
  );
};

export default AdminHomepagePage;
