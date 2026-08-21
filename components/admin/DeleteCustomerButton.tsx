"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCustomer } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

interface DeleteCustomerButtonProps {
  customerId: string;
  customerName: string;
  className?: string;
  label?: string;
}

const DeleteCustomerButton = ({
  customerId,
  customerName,
  className,
  label = "Delete",
}: DeleteCustomerButtonProps) => {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const ok = window.confirm(
          `Delete customer “${customerName}”? Their account and saved addresses will be removed. Past orders stay in the system.`,
        );
        if (!ok) return;
        const formData = new FormData();
        formData.set("customerId", customerId);
        startTransition(() => {
          void deleteCustomer(formData);
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

export default DeleteCustomerButton;
