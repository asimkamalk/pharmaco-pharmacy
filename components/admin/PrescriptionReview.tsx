"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { setPrescriptionReview } from "@/lib/actions/prescription";
import type { PrescriptionStatus } from "@/types";
import { cn } from "@/lib/utils";

interface PrescriptionReviewProps {
  orderId: string;
  status: PrescriptionStatus;
  url?: string;
  fileName?: string;
  mimeType?: string;
  reference?: string;
  adminNote?: string;
}

const statusCopy: Record<
  Exclude<PrescriptionStatus, "not_required">,
  { label: string; className: string }
> = {
  pending_review: {
    label: "Pending review",
    className: "bg-shop_orange/15 text-shop_orange",
  },
  approved: {
    label: "Approved",
    className: "bg-shop_light_green/15 text-shop_dark_green",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700",
  },
};

const PrescriptionReview = ({
  orderId,
  status,
  url,
  fileName,
  mimeType,
  reference,
  adminNote,
}: PrescriptionReviewProps) => {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle");
  const [note, setNote] = useState(adminNote ?? "");
  const [error, setError] = useState("");

  if (status === "not_required") return null;

  const meta = statusCopy[status];
  const isPdf =
    mimeType === "application/pdf" ||
    fileName?.toLowerCase().endsWith(".pdf");

  const submit = (next: "approved" | "rejected") => {
    setError("");
    if (next === "rejected" && note.trim().length < 3) {
      setError("Add a short reason for rejection (min 3 characters).");
      return;
    }
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("status", next);
    formData.set("note", note.trim());
    startTransition(() => {
      void setPrescriptionReview(formData);
    });
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-darkColor">Prescription</h2>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            meta.className,
          )}
        >
          {meta.label}
        </span>
      </div>

      {url ? (
        <div className="overflow-hidden rounded-xl border border-black/10">
          {isPdf ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-shop_light_bg/60 px-4 py-6 text-sm font-medium text-shop_dark_green hover:bg-shop_light_bg"
            >
              <FileText className="h-8 w-8" />
              <span className="min-w-0">
                <span className="block truncate">
                  {fileName || "Prescription PDF"}
                </span>
                <span className="text-xs font-normal text-lightColor">
                  Open / download
                </span>
              </span>
            </a>
          ) : (
            <a href={url} target="_blank" rel="noreferrer" className="block">
              <div className="relative aspect-[4/3] w-full bg-shop_light_bg">
                <Image
                  src={url}
                  alt={fileName || "Prescription"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </div>
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-lightColor">No file uploaded.</p>
      )}

      {reference && (
        <p className="mt-3 text-sm text-lightColor">
          Customer note:{" "}
          <span className="font-medium text-darkColor">{reference}</span>
        </p>
      )}
      {adminNote && status !== "pending_review" && (
        <p className="mt-2 rounded-lg bg-shop_light_bg/80 px-3 py-2 text-sm text-darkColor">
          Pharmacist note: {adminNote}
        </p>
      )}

      {status === "pending_review" && mode === "idle" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => setMode("approve")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-shop_btn_dark_green px-4 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90 disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setMode("reject")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}

      {status === "pending_review" && mode !== "idle" && (
        <div className="mt-4 space-y-3 rounded-xl border border-black/10 bg-shop_light_bg/40 p-4">
          <p className="text-sm font-medium text-darkColor">
            {mode === "approve"
              ? "Approve this prescription?"
              : "Reject this prescription"}
          </p>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-lightColor">
              {mode === "approve"
                ? "Optional pharmacist note"
                : "Rejection reason (required)"}
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder={
                mode === "approve"
                  ? "e.g. Verified against ID / dosage OK"
                  : "e.g. Image unreadable — please re-upload"
              }
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-shop_light_green"
            />
          </label>
          {error && (
            <p className="text-xs font-medium text-shop_orange">{error}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                submit(mode === "approve" ? "approved" : "rejected")
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60",
                mode === "approve"
                  ? "bg-shop_btn_dark_green hover:bg-shop_dark_green/90"
                  : "bg-red-600 hover:bg-red-700",
              )}
            >
              {pending
                ? "Saving…"
                : mode === "approve"
                  ? "Confirm approve"
                  : "Confirm reject"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setMode("idle");
                setError("");
              }}
              className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-darkColor hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PrescriptionReview;
