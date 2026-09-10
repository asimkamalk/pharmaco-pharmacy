"use client";

import { useEffect, useState } from "react";
import { Building2, Home, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import { getAddressLabelText, useAddresses } from "@/hooks/useAddresses";
import { useIsHydrated } from "@/hooks";
import {
  composeHayatabadAddressLine,
  extractPhaseFromText,
  HAYATABAD_PHASES,
  resolveAddressRegion,
} from "@/lib/address-format";
import { addressFormSchema, type AddressFormValues } from "@/lib/validations";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { cn } from "@/lib/utils";
import type {
  AddressLabel,
  AddressRegion,
  HayatabadPhase,
  SavedAddress,
} from "@/types";

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors duration-200 placeholder:text-lightColor/60 focus:border-shop_light_green";

type FieldErrors = Partial<
  Record<
    | keyof AddressFormValues
    | "houseNo"
    | "streetNo"
    | "sectorNo"
    | "phase"
    | "region",
    string
  >
>;

interface AddressManagerProps {
  selectable?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Live location while the form is open (for delivery fee preview) */
  onDraftLocationChange?: (
    draft: { city: string; area: string; phase?: string } | null,
  ) => void;
  /** Increment to open the add-address form (e.g. after Place Order with no address) */
  openCreateSignal?: number;
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

type FormState = AddressFormValues & {
  region: AddressRegion | null;
  houseNo: string;
  streetNo: string;
  sectorNo: string;
  phase: HayatabadPhase | "";
};

const emptyForm = (area: string, city: string): FormState => ({
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
  region: null,
  houseNo: "",
  streetNo: "",
  sectorNo: "",
  phase: "",
});

const AddressManager = ({
  selectable = false,
  selectedId,
  onSelect,
  onDraftLocationChange,
  openCreateSignal = 0,
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
  const [form, setForm] = useState<FormState>(() =>
    emptyForm(siteConfig.location.area, siteConfig.location.city),
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!openCreateSignal) return;
    setEditingId(null);
    setForm(emptyForm(siteConfig.location.area, siteConfig.location.city));
    setErrors({});
    setIsFormOpen(true);
  }, [openCreateSignal, siteConfig.location.area, siteConfig.location.city]);

  useEffect(() => {
    if (!isFormOpen || !form.region) {
      onDraftLocationChange?.(null);
      return;
    }

    if (form.region === "hayatabad") {
      onDraftLocationChange?.({
        city: "Peshawar",
        area: form.phase
          ? `Hayatabad ${form.phase}`
          : "Hayatabad",
        phase: form.phase || undefined,
      });
      return;
    }

    onDraftLocationChange?.({
      city: form.city.trim() || siteConfig.location.city,
      area: form.area.trim() || siteConfig.location.area,
    });
  }, [
    isFormOpen,
    form.region,
    form.phase,
    form.city,
    form.area,
    onDraftLocationChange,
    siteConfig.location.area,
    siteConfig.location.city,
  ]);

  const resetForm = () => {
    setForm(emptyForm(siteConfig.location.area, siteConfig.location.city));
    setErrors({});
    setEditingId(null);
    onDraftLocationChange?.(null);
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (address: SavedAddress) => {
    const region = resolveAddressRegion(address);
    const phase =
      (address.phase as HayatabadPhase | undefined) ||
      extractPhaseFromText(
        `${address.addressLine} ${address.area} ${address.phase ?? ""}`,
      ) ||
      "";

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
      region,
      houseNo: address.houseNo ?? "",
      streetNo: address.streetNo ?? "",
      sectorNo: address.sectorNo ?? "",
      phase,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const chooseRegion = (region: AddressRegion) => {
    setErrors({});
    if (region === "hayatabad") {
      setForm((prev) => ({
        ...prev,
        region,
        area: "Hayatabad",
        city: "Peshawar",
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      region,
      area:
        prev.area.toLowerCase() === "hayatabad"
          ? siteConfig.location.area
          : prev.area || siteConfig.location.area,
      city: prev.city || siteConfig.location.city,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.region) {
      setErrors({ region: "Please choose Hayatabad or Outside Hayatabad" });
      return;
    }

    const nextErrors: FieldErrors = {};
    let addressLine = form.addressLine.trim();
    let area = form.area.trim();
    let city = form.city.trim();
    let houseNo: string | undefined;
    let streetNo: string | undefined;
    let sectorNo: string | undefined;
    let phase: string | undefined;

    if (form.region === "hayatabad") {
      if (!form.houseNo.trim()) nextErrors.houseNo = "Enter house number";
      if (!form.streetNo.trim()) nextErrors.streetNo = "Enter street number";
      if (!form.sectorNo.trim()) nextErrors.sectorNo = "Enter sector";
      if (!form.phase) nextErrors.phase = "Select a phase (1–7)";

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      houseNo = form.houseNo.trim();
      streetNo = form.streetNo.trim();
      sectorNo = form.sectorNo.trim();
      phase = form.phase;
      addressLine = composeHayatabadAddressLine({
        houseNo,
        streetNo,
        sectorNo,
        phase,
      });
      area = form.phase ? `Hayatabad ${form.phase}` : "Hayatabad";
      city = "Peshawar";
    }

    const result = addressFormSchema.safeParse({
      ...form,
      addressLine,
      area,
      city,
    });
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AddressFormValues;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    const data = result.data;
    const payload = {
      ...data,
      email: data.email || undefined,
      notes: data.notes || undefined,
      customLabel: data.label === "other" ? data.customLabel : undefined,
      region: form.region,
      houseNo,
      streetNo,
      sectorNo,
      phase,
    };

    if (editingId) {
      updateAddress(editingId, payload);
      if (data.isDefault) setDefault(editingId);
      if (selectable) onSelect?.(editingId);
    } else {
      const id = addAddress({
        ...payload,
        isDefault: data.isDefault || addresses.length === 0,
      });
      if (selectable) onSelect?.(id);
    }

    setIsFormOpen(false);
    resetForm();
  };

  if (!isHydrated) {
    return (
      <div
        className={cn("h-40 animate-pulse rounded-xl bg-shop_light_bg", className)}
      />
    );
  }

  return (
    <div id="delivery-addresses" className={cn("scroll-mt-24 space-y-4", className)}>
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
                {address.area}
                {address.phase ? ` · ${address.phase}` : ""}, {address.city}
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
              Where should we deliver?
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseRegion("hayatabad")}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors",
                  form.region === "hayatabad"
                    ? "border-shop_light_green bg-shop_light_pink text-shop_dark_green"
                    : "border-black/10 text-darkColor hover:border-shop_light_green/40",
                )}
              >
                In Hayatabad
                <span className="mt-0.5 block text-xs font-normal text-lightColor">
                  House, street, sector &amp; phase
                </span>
              </button>
              <button
                type="button"
                onClick={() => chooseRegion("outside")}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors",
                  form.region === "outside"
                    ? "border-shop_light_green bg-shop_light_pink text-shop_dark_green"
                    : "border-black/10 text-darkColor hover:border-shop_light_green/40",
                )}
              >
                Outside Hayatabad
                <span className="mt-0.5 block text-xs font-normal text-lightColor">
                  Full street address form
                </span>
              </button>
            </div>
            {errors.region && (
              <p className="mt-1 text-xs text-shop_orange">{errors.region}</p>
            )}
          </fieldset>

          {form.region && (
            <>
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
                      setForm((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="Recipient name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-shop_orange">
                      {errors.fullName}
                    </p>
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
                      setForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="03XX XXXXXXX"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-shop_orange">
                      {errors.phone}
                    </p>
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

              {form.region === "hayatabad" ? (
                <div className="space-y-4 rounded-lg border border-black/10 bg-shop_light_bg/40 p-4">
                  <p className="text-xs text-lightColor">
                    Hayatabad delivery · Phase is required so our rider finds
                    you.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-darkColor">
                        House No.
                      </label>
                      <input
                        className={inputClasses}
                        value={form.houseNo}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            houseNo: event.target.value,
                          }))
                        }
                        placeholder="e.g. 177"
                      />
                      {errors.houseNo && (
                        <p className="mt-1 text-xs text-shop_orange">
                          {errors.houseNo}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-darkColor">
                        Street No.
                      </label>
                      <input
                        className={inputClasses}
                        value={form.streetNo}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            streetNo: event.target.value,
                          }))
                        }
                        placeholder="e.g. 7"
                      />
                      {errors.streetNo && (
                        <p className="mt-1 text-xs text-shop_orange">
                          {errors.streetNo}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-darkColor">
                        Sector No.
                      </label>
                      <input
                        className={inputClasses}
                        value={form.sectorNo}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            sectorNo: event.target.value,
                          }))
                        }
                        placeholder="e.g. E2"
                      />
                      {errors.sectorNo && (
                        <p className="mt-1 text-xs text-shop_orange">
                          {errors.sectorNo}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-darkColor">
                        Phase No.
                      </label>
                      <select
                        className={inputClasses}
                        value={form.phase}
                        onChange={(event) => {
                          const phase = event.target
                            .value as HayatabadPhase | "";
                          setForm((prev) => ({
                            ...prev,
                            phase,
                            area: phase
                              ? `Hayatabad ${phase}`
                              : "Hayatabad",
                            city: "Peshawar",
                          }));
                        }}
                      >
                        <option value="">Select phase</option>
                        {HAYATABAD_PHASES.map((phase) => (
                          <option key={phase} value={phase}>
                            {phase}
                          </option>
                        ))}
                      </select>
                      {errors.phase && (
                        <p className="mt-1 text-xs text-shop_orange">
                          {errors.phase}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-lightColor">
                    Area: Hayatabad
                    {form.phase ? ` · ${form.phase}` : ""} · City: Peshawar
                  </p>
                </div>
              ) : (
                <>
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
                          setForm((prev) => ({
                            ...prev,
                            area: event.target.value,
                          }))
                        }
                        placeholder={siteConfig.location.area}
                      />
                      {errors.area && (
                        <p className="mt-1 text-xs text-shop_orange">
                          {errors.area}
                        </p>
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
                          setForm((prev) => ({
                            ...prev,
                            city: event.target.value,
                          }))
                        }
                        placeholder={siteConfig.location.city}
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-shop_orange">
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

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
                    resetForm();
                  }}
                  className="inline-flex h-10 items-center rounded-lg border border-black/15 px-5 text-sm font-semibold text-darkColor transition-colors duration-200 hover:border-shop_light_green"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {!form.region && (
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              className="inline-flex h-10 items-center rounded-lg border border-black/15 px-5 text-sm font-semibold text-darkColor"
            >
              Cancel
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default AddressManager;
