"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/types/api";
import { useChangePassword } from "@/features/account/hooks/use-account";

const passwordSchema = (minLength: number) =>
  z
    .object({
      currentPassword: z.string().min(1, "Enter your current password"),
      newPassword: z
        .string()
        .min(minLength, `At least ${minLength} characters`)
        .max(128, "At most 128 characters"),
      confirmPassword: z.string().min(1, "Repeat the new password"),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      path: ["confirmPassword"],
      message: "Doesn't match the new password",
    })
    .refine((d) => d.newPassword !== d.currentPassword, {
      path: ["newPassword"],
      message: "Must be different from the current password",
    });

type PasswordInput = z.infer<ReturnType<typeof passwordSchema>>;

/** Change password; the API signs every other device out when it succeeds. */
export function ChangePasswordForm({ minLength }: { minLength: number }) {
  const schema = useMemo(() => passwordSchema(minLength), [minLength]);
  const mutation = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: PasswordInput) {
    try {
      await mutation.mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      reset();
    } catch {
      // Shown below from mutation.error.
    }
  }

  const fields: { name: keyof PasswordInput; label: string; autoComplete: string; hint?: string }[] = [
    { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
    { name: "newPassword", label: "New password", autoComplete: "new-password", hint: `At least ${minLength} characters.` },
    { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-sm flex-col gap-4">
      {fields.map((f) => (
        <div key={f.name} className="flex flex-col gap-1.5">
          <Label htmlFor={f.name}>{f.label}</Label>
          <Input
            id={f.name}
            type="password"
            autoComplete={f.autoComplete}
            aria-invalid={!!errors[f.name]}
            aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
            {...register(f.name)}
          />
          {errors[f.name] ? (
            <p id={`${f.name}-error`} className="text-xs text-destructive">
              {errors[f.name]?.message}
            </p>
          ) : (
            f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>
          )}
        </div>
      ))}

      {mutation.isError && <p className="text-sm text-destructive">{getErrorMessage(mutation.error)}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Change password
        </Button>
        <p className="text-xs text-muted-foreground">Signs out your other devices.</p>
      </div>
    </form>
  );
}
