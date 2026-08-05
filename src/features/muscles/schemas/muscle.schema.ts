import { z } from "zod";

export const muscleFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  body_region: z.string().max(100).optional(),
  display_order: z
    .string()
    .min(1, "Display order is required")
    .refine(
      (v) => !isNaN(parseInt(v, 10)) && parseInt(v, 10) >= 0,
      "Must be a whole number ≥ 0",
    ),
  xp_enabled: z.boolean(),
  recovery_enabled: z.boolean(),
});

export type MuscleFormInput = z.infer<typeof muscleFormSchema>;
