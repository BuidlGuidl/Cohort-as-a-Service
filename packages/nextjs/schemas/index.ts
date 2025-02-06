import * as z from "zod";

export const CreateCohortSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  adminAddress: z
    .string()
    .min(1, "Admin address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  currencyAddress: z
    .string()
    .min(1, "Currency address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
});
