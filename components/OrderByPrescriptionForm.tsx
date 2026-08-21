"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import AddressManager from "@/components/AddressManager";
import { uploadPrescription } from "@/lib/actions/prescription";
import { submitPrescriptionOrder } from "@/lib/actions/prescription-request";
import { useAddresses } from "@/hooks/useAddresses";
import { useIsHydrated } from "@/hooks";
import { cn } from "@/lib/utils";
import type { PrescriptionUploadValue } from "@/components/PrescriptionUpload";

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors placeholder:text-lightColor/60 focus:border-shop_light_green";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

interface OrderByPrescriptionFormProps {
  isSignedIn?: boolean;
}

const OrderByPrescriptionForm = ({
  isSignedIn,
}: OrderByPrescriptionFormProps) => {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const addresses = useAddresses((state) => state.addresses);
  const getDefault = useAddresses((state) => state.getDefault);

  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [prescription, setPrescription] =
    useState<PrescriptionUploadValue>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [done, setDone] = useState<{ requestNumber: string } | null>(null);
  const [medicinesNote, setMedicinesNote] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const defaultAddressId = isHydrated
    ? (getDefault()?.id ?? addresses[0]?.id ?? "")
    : "";
  const activeAddressId = selectedAddressId ?? defaultAddressId;
  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === activeAddressId),
    [addresses, activeAddressId],
  );

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    setUploadError("");
    if (!ALLOWED.includes(file.type)) {
      setUploadError("Use JPG, PNG, WebP, or PDF (max 5MB)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("prescription", file);
      const saved = await uploadPrescription(formData);
      setPrescription(saved);
      setPreviewUrl(
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      );
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not upload file",
      );
      setPrescription(null);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!prescription?.url) {
      setError("Upload a clear photo or PDF of your prescription");
      return;
    }
    if (!selectedAddress) {
      setError("Please select or add a delivery address");
      return;
    }

    const formData = new FormData();
    formData.set("medicinesNote", medicinesNote);
    formData.set("prescriptionUrl", prescription.url);
    formData.set("prescriptionFileName", prescription.fileName);
    formData.set("prescriptionMimeType", prescription.mimeType);
    formData.set("customerName", selectedAddress.fullName);
    formData.set("customerPhone", selectedAddress.phone);
    formData.set("customerEmail", selectedAddress.email ?? "");
    formData.set("addressLabel", selectedAddress.label);
    formData.set(
      "addressCustomLabel",
      selectedAddress.customLabel ?? "",
    );
    formData.set("addressLine", selectedAddress.addressLine);
    formData.set("area", selectedAddress.area);
    formData.set("city", selectedAddress.city);

    startTransition(async () => {
      const result = await submitPrescriptionOrder(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone({ requestNumber: result.requestNumber });
      router.refresh();
    });
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-shop_light_green/30 bg-shop_light_green/10 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-shop_light_green" />
          <div>
            <h2 className="text-lg font-semibold text-darkColor">
              Prescription received
            </h2>
            <p className="mt-2 text-sm text-lightColor">
              Your request{" "}
              <strong className="text-darkColor">{done.requestNumber}</strong>{" "}
              is with our pharmacist. We will build your order from the
              prescription
              {medicinesNote.trim() ? " and your medicines note" : ""}, then
              confirm by phone if needed.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {isSignedIn ? (
                <Link
                  href="/account/prescription-requests"
                  className="inline-flex h-10 items-center rounded-lg bg-shop_btn_dark_green px-5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
                >
                  View my requests
                </Link>
              ) : null}
              <Link
                href="/shop"
                className="inline-flex h-10 items-center rounded-lg border border-black/15 px-5 text-sm font-semibold text-darkColor hover:border-shop_light_green"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPdf =
    prescription?.mimeType === "application/pdf" ||
    prescription?.fileName?.toLowerCase().endsWith(".pdf");

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-shop_orange/30 bg-shop_light_pink/40 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-shop_orange" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-darkColor">
              1. Upload your prescription
            </h2>
            <p className="mt-1 text-sm text-lightColor">
              Clear photo or PDF. Our pharmacist will read it and prepare your
              order.
            </p>

            {!prescription ? (
              <label
                htmlFor={fileInputId}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  void handleFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
                  dragging
                    ? "border-shop_orange bg-shop_orange/10"
                    : "border-shop_orange/40 bg-white hover:border-shop_orange",
                  uploading && "pointer-events-none opacity-70",
                )}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-shop_orange" />
                ) : (
                  <Upload className="h-8 w-8 text-shop_orange" />
                )}
                <span className="text-sm font-semibold text-darkColor">
                  {uploading
                    ? "Uploading…"
                    : "Drop prescription here or click to browse"}
                </span>
                <span className="text-xs text-lightColor">
                  JPG, PNG, WebP or PDF · Max 5MB
                </span>
                <input
                  ref={inputRef}
                  id={fileInputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => void handleFile(e.target.files?.[0])}
                />
              </label>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-black/10 bg-white p-3">
                {isPdf ? (
                  <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-shop_light_bg text-shop_dark_green">
                    <FileText className="h-7 w-7" />
                  </span>
                ) : (
                  <span className="relative h-16 w-16 overflow-hidden rounded-lg border bg-shop_light_bg">
                    <Image
                      src={previewUrl || prescription.url}
                      alt="Prescription"
                      fill
                      unoptimized={Boolean(previewUrl)}
                      className="object-cover"
                      sizes="64px"
                    />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-shop_dark_green">
                    Uploaded
                  </p>
                  <p className="truncate text-xs text-lightColor">
                    {prescription.fileName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrescription(null);
                    setPreviewUrl(null);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            )}
            {uploadError && (
              <p className="mt-2 text-xs font-medium text-shop_orange">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-darkColor">
          2. What medicines do you need?{" "}
          <span className="font-normal text-lightColor">(optional)</span>
        </h2>
        <p className="mt-1 text-sm text-lightColor">
          Optional — add a short note if you want (e.g. pack size). The
          pharmacist can also read everything from the prescription.
        </p>
        <textarea
          rows={4}
          value={medicinesNote}
          onChange={(e) => setMedicinesNote(e.target.value)}
          placeholder="e.g. I need Augmentin 625mg (1 pack), Panadol Extra, and vitamin D drops for my child"
          className={cn(inputClasses, "mt-3 resize-y")}
        />
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-darkColor">
          3. Delivery address
        </h2>
        <p className="mt-1 text-sm text-lightColor">
          Choose a saved address or add a new one. We will deliver here after
          the pharmacist prepares your order.
        </p>
        <div className="mt-4">
          {!isHydrated ? (
            <p className="text-sm text-lightColor">Loading addresses…</p>
          ) : (
            <AddressManager
              selectable
              selectedId={activeAddressId}
              onSelect={setSelectedAddressId}
            />
          )}
        </div>
        {!isSignedIn && (
          <p className="mt-3 text-xs text-lightColor">
            <Link
              href="/sign-in?callbackUrl=/order-by-prescription"
              className="font-semibold text-shop_dark_green hover:underline"
            >
              Sign in
            </Link>{" "}
            to track this request in your account.
          </p>
        )}
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-shop_orange/30 bg-shop_light_pink/50 px-4 py-3 text-sm text-shop_orange"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-shop_btn_dark_green px-6 text-sm font-semibold text-white hover:bg-shop_dark_green/90 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Submitting…" : "Submit prescription request"}
      </button>
    </form>
  );
};

export default OrderByPrescriptionForm;
