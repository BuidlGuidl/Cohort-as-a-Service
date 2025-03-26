import * as z from "zod";

export const CreateCohortSchema = z.object({
  name: z.string().min(1, "Name is required").max(40, "Name cannot exceed 40 characters"),
  description: z.string().min(1, "Description is required"),
  adminAddress: z
    .string()
    .min(1, "Admin address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  currencyAddress: z
    .string()
    .min(1, "Currency address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  cycle: z
    .number({ invalid_type_error: "Cycle is required" })
    .refine(val => Number.isInteger(val), { message: "Cycle must be an integer" })
    .refine(val => val >= 0, { message: "Cycle must be a positive number" }),
  builderAddresses: z
    .array(
      z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address")
        .or(z.literal("")),
    )
    .optional()
    .default([]),
  builderCaps: z
    .array(z.number({ invalid_type_error: "Cap is required" }).positive("Cap must be at least 1"))
    .optional()
    .default([]),
  requiresApproval: z.boolean().default(false),
});
