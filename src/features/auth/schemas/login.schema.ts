import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email").default("test@test.com"),
  password: z.string().min(1, "Password is required").default("test@test.com"),
});

export type LoginInput = z.infer<typeof loginSchema>;
