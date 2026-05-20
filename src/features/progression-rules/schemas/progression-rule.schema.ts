import { z } from "zod";

export const progressionRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.enum([
    "double_progression",
    "static_load",
    "rir_based",
    "rir_cycling",
    "percentage_based",
  ]),
  config: z
    .string()
    .min(1, "Config is required")
    .refine((v) => {
      try {
        JSON.parse(v);
        return true;
      } catch {
        return false;
      }
    }, "Must be valid JSON"),
});

export type ProgressionRuleInput = z.infer<typeof progressionRuleSchema>;
