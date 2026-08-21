"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteOrder } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

interface DeleteOrderButtonProps {
  orderId: string;
  orderNumber: string;
  className?: string;
  label?: string;
}

const DeleteOrderButton = ({
  orderId,
  orderNumber,
  className,
  label = "Delete",
}: DeleteOrderButtonProps) => {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const ok = window.confirm(
          `Delete order ${orderNumber}? This cannot be undone.`,
        );
        if (!ok) return;
        const formData = new FormData();
        formData.set("orderId", orderId);
        startTransition(() => {
          void deleteOrder(formData);
        });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-60",
        className,
      )}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "Deleting…" : label}
    </button>
  );
};

export default DeleteOrderButton;
