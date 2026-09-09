import Link from "next/link";
import AdminFlash from "@/components/admin/AdminFlash";
import {
  deleteDeliveryZone,
  saveDeliveryZone,
} from "@/lib/actions/delivery-zones";
import { listDeliveryZones } from "@/lib/delivery";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Delivery zones · Admin" };

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

interface PageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const DeliveryZonesPage = async ({ searchParams }: PageProps) => {
  const { saved, error } = await searchParams;
  const zones = await listDeliveryZones(true);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-darkColor">Delivery zones</h1>
          <p className="text-sm text-lightColor">
            Set different delivery fees by city and area. Leave area blank for a
            whole-city rate. Fallback is the standard fee in Settings.
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          ← Site settings
        </Link>
      </div>

      <AdminFlash
        saved={saved}
        error={error}
        savedMessage="Delivery zones updated."
      />

      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-darkColor">Add zone</h2>
        <form
          action={saveDeliveryZone}
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        >
          <label className="space-y-1 text-sm">
            <span>Label</span>
            <input
              name="label"
              required
              placeholder="Hayatabad Phase 1"
              className={field}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>City</span>
            <input
              name="city"
              required
              defaultValue="Peshawar"
              className={field}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Area (optional)</span>
            <input
              name="area"
              placeholder="Phase 1 / leave blank for city-wide"
              className={field}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Delivery fee (PKR)</span>
            <input
              name="fee"
              type="number"
              min={0}
              required
              defaultValue={150}
              className={field}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Free above (PKR, optional)</span>
            <input
              name="freeDeliveryAbove"
              type="number"
              min={0}
              placeholder="Use site default"
              className={field}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Sort order</span>
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={0}
              className={field}
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="rounded-lg bg-shop_btn_dark_green px-4 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
            >
              Add delivery zone
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-shop_light_bg/60 text-xs uppercase tracking-wide text-lightColor">
            <tr>
              <th className="px-4 py-3 font-semibold">Zone</th>
              <th className="px-4 py-3 font-semibold">Fee</th>
              <th className="px-4 py-3 font-semibold">Free above</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {zones.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-lightColor"
                >
                  No zones yet. Add areas above, or use the site standard fee.
                </td>
              </tr>
            ) : (
              zones.map((zone) => (
                <tr key={zone.id} className="align-top">
                  <td className="px-4 py-3">
                    <form
                      action={saveDeliveryZone}
                      className="grid max-w-xl gap-2"
                    >
                      <input type="hidden" name="id" value={zone.id} />
                      <input
                        name="label"
                        required
                        defaultValue={zone.label}
                        className={field}
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          name="city"
                          required
                          defaultValue={zone.city}
                          className={field}
                        />
                        <input
                          name="area"
                          defaultValue={zone.area}
                          placeholder="Area"
                          className={field}
                        />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <input
                          name="fee"
                          type="number"
                          min={0}
                          required
                          defaultValue={zone.fee}
                          className={field}
                        />
                        <input
                          name="freeDeliveryAbove"
                          type="number"
                          min={0}
                          defaultValue={zone.freeDeliveryAbove ?? ""}
                          placeholder="Site default"
                          className={field}
                        />
                        <input
                          name="sortOrder"
                          type="number"
                          min={0}
                          defaultValue={zone.sortOrder}
                          className={field}
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={zone.isActive}
                        />
                        Active
                      </label>
                      <button
                        type="submit"
                        className="w-fit rounded-lg border border-black/15 px-3 py-1.5 text-xs font-semibold hover:border-shop_light_green"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(zone.fee)}
                  </td>
                  <td className="px-4 py-3 text-lightColor">
                    {zone.freeDeliveryAbove != null
                      ? formatPrice(zone.freeDeliveryAbove)
                      : "Site default"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {zone.isActive ? "Active" : "Off"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteDeliveryZone}>
                      <input type="hidden" name="id" value={zone.id} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DeliveryZonesPage;
