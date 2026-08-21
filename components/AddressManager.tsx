"use client";

import { useState } from "react";
import { Building2, Home, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import { getAddressLabelText, useAddresses } from "@/hooks/useAddresses";
import { useIsHydrated } from "@/hooks";
import { addressFormSchema, type AddressFormValues } from "@/lib/validations";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { cn } from "@/lib/utils";
import type { AddressLabel, SavedAddress } from "@/types";

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors duration-200 placeholder:text-lightColor/60 focus:border-shop_light_green";

type FieldErrors = Partial<Record<keyof AddressFormValues, string>>;

interface AddressManagerProps {
  /** When set, selecting an address notifies the parent (checkout). */
  selectable?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

const labelOptions: {
  value: AddressLabel;
  title: string;
  icon: typeof Home;
}[] = [
  { value: "home", title: "Home", icon: Home },
  { value: "office", title: "Office", icon: Building2 },
  { value: "other", title: "Other", icon: MapPinned },
];

const emptyForm = (area: string, city: string): AddressFormValues => ({
  label: "home",
  customLabel: "",
  fullName: "",
  phone: "",
  email: "",
  addressLine: "",
  area,
  city,
  notes: "",
  isDefault: false,
});

const AddressManager = ({
  selectable = false,
  selectedId,
  onSelect,
  className,
}: AddressManagerProps) => {
  const siteConfig = useSiteConfig();
  const isHydrated = useIsHydrated();
  const addresses = useAddresses((state) => state.addresses);
  const addAddress = useAddresses((state) => state.addAddress);
  const updateAddress = useAddresses((state) => state.updateAddress);
  const removeAddress = useAddresses((state) => state.removeAddress);
  const setDefault = useAddresses((state) => state.setDefault);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormValues>(() =>
    emptyForm(siteConfig.location.area, siteConfig.location.city),
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(siteConfig.location.area, siteConfig.location.city));
    setErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (address: SavedAddress) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      customLabel: address.customLabel ?? "",
      fullName: address.fullName,
      phone: address.phone,
      email: address.email ?? "",
      addressLine: address.addressLine,
      area: address.area,
      city: address.city,
      notes: address.notes ?? "",
      isDefault: address.isDefault,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = addressFormSchema.safeParse(form);
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AddressFormValues;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }

    const data = result.data;
    if (editingId) {
      updateAddress(editingId, {
        ...data,
        email: data.email || undefined,
        notes: data.notes || undefined,
        customLabel: data.label === "other" ? data.customLabel : undefined,
      });
      if (data.isDefault) setDefault(editingId);
      if (selectable) onSelect?.(editingId);
    } else {
      const id = addAddress({
        ...data,
        email: data.email || undefined,
        notes: data.notes || undefined,
        customLabel: data.label === "other" ? data.customLabel : undefined,
        isDefault: data.isDefault || addresses.length === 0,
      });
      if (selectable) onSelect?.(id);
    }

    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm(siteConfig.location.area, siteConfig.location.city));
    setErrors({});
  };

  if (!isHydrated) {
    return (
      <div className={cn("h-40 animate-pulse rounded-xl bg-shop_light_bg", className)} />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-darkColor">
          Delivery Addresses
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-shop_btn_dark_green px-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add Address
        </button>
      </div>

      {addresses.length === 0 && !isFormOpen && (
        <div className="rounded-xl border border-dashed border-black/15 bg-shop_light_bg/50 px-5 py-8 text-center">
          <p className="text-sm text-lightColor">
            No saved addresses yet. Add Home, Office, or another delivery
            location.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 text-sm font-semibold text-shop_light_green hover:text-shop_dark_green"
          >
            Add your first address
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {addresses.map((address) => {
          const isSelected = selectedId === address.id;
          const LabelIcon =
            labelOptions.find((opt) => opt.value === address.label)?.icon ??
            MapPinned;

          return (
            <div
              key={address.id}
              className={cn(
                "relative rounded-xl border p-4 transition-all duration-200",
                selectable && "cursor-pointer",
                isSelected
                  ? "border-shop_light_green bg-shop_light_pink/40 shadow-sm"
                  : "border-black/10 bg-white hover:border-shop_light_green/40",
              )}
              onClick={() => selectable && onSelect?.(address.id)}
              onKeyDown={(event) => {
                if (!selectable) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect?.(address.id);
                }
              }}
              role={selectable ? "button" : undefined}
              tabIndex={selectable ? 0 : undefined}
              aria-pressed={selectable ? isSelected : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-shop_light_pink">
                    <LabelIcon className="h-4 w-4 text-shop_dark_green" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-darkColor">
                      {getAddressLabelText(address)}
                      {address.isDefault && (
                        <span className="ml-2 rounded bg-shop_light_green/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-shop_light_green">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-lightColor">{address.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Edit address"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(address);
                    }}
                    className="rounded-md p-1.5 text-lightColor hover:bg-shop_light_bg hover:text-shop_dark_green"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete address"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeAddress(address.id);
                    }}
                    className="rounded-md p-1.5 text-lightColor hover:bg-shop_light_pink hover:text-shop_orange"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-lightColor">
                {address.addressLine}
                <br />
                {address.area}, {address.city}
                <br />
                {address.phone}
              </p>
              {!address.isDefault && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDefault(address.id);
                  }}
                  className="mt-3 text-xs font-semibold text-shop_light_green hover:text-shop_dark_green"
                >
                  Set as default
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-shop_light_green/30 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-darkColor">
            {editingId ? "Edit Address" : "New Address"}
          </h3>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-lightColor">
              Address type
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {labelOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, label: option.value }))
                  }
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-semibold transition-colors duration-200",
                    form.label === option.value
                      ? "border-shop_light_green bg-shop_light_pink text-shop_dark_green"
                      : "border-black/10 text-lightColor hover:border-shop_light_green/40",
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  {option.title}
                </button>
              ))}
            </div>
          </fieldset>

          {form.label === "other" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-darkColor">
                Custom label
              </label>
              <input
                className={inputClasses}
                value={form.customLabel ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    customLabel: event.target.value,
                  }))
                }
                placeholder="e.g. Parents' house"
              />
              {errors.customLabel && (
                <p className="mt-1 text-xs text-shop_orange">
                  {errors.customLabel}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-darkColor">
                Full name
              </label>
              <input
                className={inputClasses}
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                placeholder="Recipient name"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-shop_orange">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-darkColor">
                Phone
              </label>
              <input
                className={inputClasses}
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                placeholder="03XX XXXXXXX"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-shop_orange">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-darkColor">
              Email (optional)
            </label>
            <input
              className={inputClasses}
              type="email"
              value={form.email ?? ""}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-darkColor">
              Street address
            </label>
            <input
              className={inputClasses}
              value={form.addressLine}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  addressLine: event.target.value,
                }))
              }
              placeholder="House / street / landmark"
            />
            {errors.addressLine && (
              <p className="mt-1 text-xs text-shop_orange">
                {errors.addressLine}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-darkColor">
                Area
              </label>
              <input
                className={inputClasses}
                value={form.area}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, area: event.target.value }))
                }
                placeholder={siteConfig.location.area}
              />
              {errors.area && (
                <p className="mt-1 text-xs text-shop_orange">{errors.area}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-darkColor">
                City
              </label>
              <input
                className={inputClasses}
                value={form.city}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
                placeholder={siteConfig.location.city}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-shop_orange">{errors.city}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-darkColor">
              Delivery notes (optional)
            </label>
            <textarea
              className={inputClasses}
              rows={2}
              value={form.notes ?? ""}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              placeholder="Gate code, landmark, preferred time..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-darkColor">
            <input
              type="checkbox"
              checked={Boolean(form.isDefault)}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  isDefault: event.target.checked,
                }))
              }
              className="rounded border-black/20"
            />
            Set as default address
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-shop_btn_dark_green px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
            >
              {editingId ? "Save changes" : "Save address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
                setErrors({});
              }}
              className="inline-flex h-10 items-center rounded-lg border border-black/15 px-5 text-sm font-semibold text-darkColor transition-colors duration-200 hover:border-shop_light_green"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddressManager;
