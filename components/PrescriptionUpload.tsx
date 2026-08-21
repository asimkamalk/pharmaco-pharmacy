"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { uploadPrescription } from "@/lib/actions/prescription";
import { cn } from "@/lib/utils";

export type PrescriptionUploadValue = {
  url: string;
  fileName: string;
  mimeType: string;
} | null;

interface PrescriptionUploadProps {
  value: PrescriptionUploadValue;
  onChange: (value: PrescriptionUploadValue) => void;
  note: string;
  onNoteChange: (note: string) => void;
  whatsapp?: string;
  error?: string;
  noteError?: string;
}

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const PrescriptionUpload = ({
  value,
  onChange,
  note,
  onNoteChange,
  whatsapp,
  error,
  noteError,
}: PrescriptionUploadProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayError = localError || error;

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    setLocalError("");

    if (!ALLOWED.includes(file.type)) {
      setLocalError("Use JPG, PNG, WebP, or PDF (max 5MB)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("File must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("prescription", file);
      const saved = await uploadPrescription(formData);
      onChange(saved);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Could not upload prescription",
      );
      onChange(null);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clear = () => {
    onChange(null);
    setPreviewUrl(null);
    setLocalError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isPdf =
    value?.mimeType === "application/pdf" ||
    value?.fileName?.toLowerCase().endsWith(".pdf");

  return (
    <section className="rounded-2xl border border-shop_orange/30 bg-shop_light_pink/40 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-shop_orange" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-darkColor">
            Prescription required
          </h2>
          <p className="mt-1 text-sm text-lightColor">
            Your cart includes prescription medicines. Upload a clear photo or
            PDF of a valid prescription. Our pharmacist will verify it before
            dispatch.
          </p>

          {!value ? (
            <label
              htmlFor={inputId}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void handleFile(event.dataTransfer.files?.[0]);
              }}
              className={cn(
                "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
                dragging
                  ? "border-shop_orange bg-shop_orange/10"
                  : "border-shop_orange/40 bg-white hover:border-shop_orange hover:bg-shop_orange/5",
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
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                disabled={uploading}
                onChange={(event) =>
                  void handleFile(event.target.files?.[0])
                }
              />
            </label>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white">
              <div className="flex items-start gap-3 p-3">
                {isPdf ? (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-shop_light_bg text-shop_dark_green">
                    <FileText className="h-7 w-7" />
                  </span>
                ) : (
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-shop_light_bg">
                    <Image
                      src={previewUrl || value.url}
                      alt="Prescription preview"
                      fill
                      unoptimized={Boolean(previewUrl)}
                      className="object-cover"
                      sizes="64px"
                    />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-shop_dark_green">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Prescription uploaded
                  </p>
                  <p className="mt-0.5 truncate text-xs text-lightColor">
                    {value.fileName}
                  </p>
                  <a
                    href={value.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-shop_light_green hover:text-shop_dark_green"
                  >
                    Preview file
                  </a>
                </div>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          )}

          {displayError && (
            <p role="alert" className="mt-2 text-xs font-medium text-shop_orange">
              {displayError}
            </p>
          )}

          <label className="mt-4 block space-y-1.5">
            <span className="text-sm font-medium text-darkColor">
              Optional note{" "}
              <span className="font-normal text-lightColor">
                (doctor name, date, etc.)
              </span>
            </span>
            <input
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="e.g. Dr. Ahmed · issued today"
              className="w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green"
            />
            {noteError && (
              <p className="text-xs text-shop_orange">{noteError}</p>
            )}
          </label>

          {whatsapp && (
            <p className="mt-3 text-xs text-lightColor">
              Prefer WhatsApp? You can also send the photo to{" "}
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-shop_dark_green hover:underline"
              >
                {whatsapp}
              </a>{" "}
              and mention your order number after placing the order — uploading
              here is faster for verification.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PrescriptionUpload;
