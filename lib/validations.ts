import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(10, "Please enter a valid phone number")
    .max(20, "Please enter a valid phone number")
    .regex(/^[+\d][\d\s-]+$/, "Please enter a valid phone number"),
  subject: z
    .string()
    .trim()
    .min(3, "Please enter a subject")
    .max(150, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Please write a message of at least 10 characters")
    .max(2000, "Message is too long"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const addressFormSchema = z
  .object({
    label: z.enum(["home", "office", "other"]),
    customLabel: z.string().trim().max(40).optional(),
    fullName: z
      .string()
      .trim()
      .min(2, "Please enter the recipient name")
      .max(100),
    phone: z
      .string()
      .trim()
      .min(10, "Please enter a valid phone number")
      .max(20)
      .regex(/^[+\d][\d\s-]+$/, "Please enter a valid phone number"),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email")
      .optional()
      .or(z.literal("")),
    addressLine: z
      .string()
      .trim()
      .min(5, "Please enter a street address")
      .max(250),
    area: z.string().trim().min(2, "Please enter an area").max(100),
    city: z.string().trim().min(2, "Please enter a city").max(100),
    notes: z.string().trim().max(300).optional(),
    isDefault: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.label === "other" && !data.customLabel?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["customLabel"],
        message: "Please name this address (e.g. Parents' house)",
      });
    }
  });

export type AddressFormValues = z.infer<typeof addressFormSchema>;

export const checkoutFormSchema = z
  .object({
    addressId: z.string().min(1, "Please select a delivery address"),
    paymentMethod: z.enum([
      "cash_on_delivery",
      "bank_transfer",
      "easypaisa",
      "jazzcash",
    ]),
    paymentReference: z.string().trim().max(80).optional(),
    prescriptionReference: z.string().trim().max(200).optional(),
    orderNotes: z.string().trim().max(500).optional(),
    requiresPrescription: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== "cash_on_delivery") {
      if (!data.paymentReference?.trim() || data.paymentReference.trim().length < 4) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentReference"],
          message: "Enter your transaction / reference ID after paying",
        });
      }
    }
    if (data.requiresPrescription) {
      if (
        !data.prescriptionReference?.trim() ||
        data.prescriptionReference.trim().length < 3
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["prescriptionReference"],
          message:
            "Provide a prescription reference (photo WhatsApp number, file name, or note)",
        });
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
