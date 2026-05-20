import { z } from "zod";

export const exerciseFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

export type ExerciseFormInput = z.infer<typeof exerciseFormSchema>;
