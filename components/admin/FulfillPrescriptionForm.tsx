"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { FileText, Plus, Search, Trash2 } from "lucide-react";
import {
  fulfillPrescriptionRequestAction,
  markPrescriptionRequestInProgress,
  rejectPrescriptionRequest,
} from "@/lib/actions/prescription-request";
import { formatPrice, getDiscountedPrice, cn } from "@/lib/utils";
import type { PrescriptionRequestRecord } from "@/lib/prescription-requests";
import type { Product } from "@/types";

type Line = {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
};

interface FulfillPrescriptionFormProps {
  request: PrescriptionRequestRecord;
}

const FulfillPrescriptionForm = ({ request }: FulfillPrescriptionFormProps) => {
  const [lines, setLines] = useState<Line[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [paymentReference, setPaymentReference] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [pending, startTransition] = useTransition();

  const isPdf =
    request.prescriptionMimeType === "application/pdf" ||
    request.prescriptionFileName?.toLowerCase().endsWith(".pdf");

  const canFulfill =
    request.status === "pending" || request.status === "in_progress";

  const search = async () => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/catalog/search?q=${encodeURIComponent(q)}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setResults((data.products as Product[]) ?? []);
    } finally {
      setSearching(false);
    }
  };

  const addProduct = (product: Product) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unitPrice: getDiscountedPrice(product.price, product.discount),
          quantity: 1,
        },
      ];
    });
  };

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines],
  );

  if (request.status === "fulfilled") {
    return (
      <p className="rounded-xl border border-shop_light_green/30 bg-shop_light_green/10 px-4 py-3 text-sm text-shop_dark_green">
        Fulfilled
        {request.orderNumber ? (
          <>
            {" "}
            as order{" "}
            <a
              href={`/admin/orders/${request.orderId}`}
              className="font-semibold underline"
            >
              {request.orderNumber}
            </a>
          </>
        ) : null}
        .
      </p>
    );
  }

  if (request.status === "rejected" || request.status === "cancelled") {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        This request is {request.status}
        {request.adminNote ? `: ${request.adminNote}` : "."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-darkColor">Prescription file</h2>
        {isPdf ? (
          <a
            href={request.prescriptionUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl bg-shop_light_bg/60 px-4 py-5 text-sm font-medium text-shop_dark_green hover:bg-shop_light_bg"
          >
            <FileText className="h-8 w-8" />
            Open PDF · {request.prescriptionFileName || "prescription.pdf"}
          </a>
        ) : (
          <a
            href={request.prescriptionUrl}
            target="_blank"
            rel="noreferrer"
            className="relative block aspect-[4/3] overflow-hidden rounded-xl border border-black/10 bg-shop_light_bg"
          >
            <Image
              src={request.prescriptionUrl}
              alt="Prescription"
              fill
              className="object-contain"
              sizes="(max-width:768px) 100vw, 480px"
            />
          </a>
        )}
        <div className="mt-4 rounded-xl bg-shop_light_pink/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-shop_orange">
            Customer medicines note
          </p>
          <p className="mt-1 text-sm text-darkColor whitespace-pre-wrap">
            {request.medicinesNote}
          </p>
        </div>
      </section>

      {canFulfill && (
        <>
          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-darkColor">
              Build order · add products
            </h2>
            <div className="flex gap-2">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lightColor" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void search();
                    }
                  }}
                  placeholder="Search catalog by name or SKU…"
                  className="w-full rounded-xl border border-black/15 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-shop_light_green"
                />
              </label>
              <button
                type="button"
                onClick={() => void search()}
                disabled={searching}
                className="rounded-xl bg-shop_btn_dark_green px-4 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90 disabled:opacity-60"
              >
                {searching ? "…" : "Search"}
              </button>
            </div>
            {results.length > 0 && (
              <ul className="mt-3 max-h-56 divide-y divide-black/5 overflow-y-auto rounded-xl border border-black/10">
                {results.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-darkColor">
                        {product.name}
                      </p>
                      <p className="text-xs text-lightColor">
                        {product.sku} ·{" "}
                        {formatPrice(
                          getDiscountedPrice(product.price, product.discount),
                        )}{" "}
                        · Stock {product.stock}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProduct(product)}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-semibold text-shop_dark_green hover:bg-shop_light_bg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {lines.length === 0 ? (
              <p className="mt-4 text-sm text-lightColor">
                No products added yet. Search and add medicines matching the
                prescription and customer note.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-black/5 rounded-xl border border-black/10">
                {lines.map((line) => (
                  <li
                    key={line.productId}
                    className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-darkColor">{line.name}</p>
                      <p className="text-xs text-lightColor">
                        {line.sku} · {formatPrice(line.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => {
                          const quantity = Math.max(
                            1,
                            Number(e.target.value) || 1,
                          );
                          setLines((prev) =>
                            prev.map((row) =>
                              row.productId === line.productId
                                ? { ...row, quantity }
                                : row,
                            ),
                          );
                        }}
                        className="w-16 rounded-lg border border-black/15 px-2 py-1.5 text-center text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLines((prev) =>
                            prev.filter(
                              (row) => row.productId !== line.productId,
                            ),
                          )
                        }
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {lines.length > 0 && (
              <p className="mt-3 text-sm font-semibold text-shop_dark_green">
                Subtotal (before delivery): {formatPrice(subtotal)}
              </p>
            )}
          </section>

          <form
            action={(formData) => {
              formData.set(
                "itemsJson",
                JSON.stringify(
                  lines.map((line) => ({
                    productId: line.productId,
                    quantity: line.quantity,
                  })),
                ),
              );
              startTransition(() => {
                void fulfillPrescriptionRequestAction(formData);
              });
            }}
            className="space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <input type="hidden" name="requestId" value={request.id} />
            <h2 className="font-semibold text-darkColor">
              Create order from this prescription
            </h2>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Payment method</span>
              <select
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm"
              >
                <option value="cash_on_delivery">Cash on delivery</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
              </select>
            </label>
            {paymentMethod !== "cash_on_delivery" && (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Payment reference</span>
                <input
                  name="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm"
                />
              </label>
            )}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">
                Pharmacist note (optional)
              </span>
              <textarea
                name="adminNote"
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm"
                placeholder="e.g. Substituted brand as per stock"
              />
            </label>
            <button
              type="submit"
              disabled={pending || lines.length === 0}
              className={cn(
                "inline-flex h-11 items-center rounded-xl bg-shop_btn_dark_green px-5 text-sm font-semibold text-white hover:bg-shop_dark_green/90 disabled:opacity-50",
              )}
            >
              {pending ? "Creating order…" : "Create order"}
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            {request.status === "pending" && (
              <form action={markPrescriptionRequestInProgress}>
                <input type="hidden" name="id" value={request.id} />
                <button
                  type="submit"
                  className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-darkColor hover:bg-shop_light_bg"
                >
                  Mark in progress
                </button>
              </form>
            )}
            <form
              action={rejectPrescriptionRequest}
              className="flex flex-wrap items-end gap-2"
            >
              <input type="hidden" name="id" value={request.id} />
              <label className="block space-y-1">
                <span className="text-xs font-medium text-lightColor">
                  Reject reason
                </span>
                <input
                  name="adminNote"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  required
                  minLength={3}
                  placeholder="Unreadable Rx / missing info"
                  className="rounded-lg border border-black/15 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="submit"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Reject
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default FulfillPrescriptionForm;
