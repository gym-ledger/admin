"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Dumbbell } from "lucide-react";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/login.schema";
import { loginAdmin } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { decodeJwtExpiry, normalizeExpiresAt } from "@/auth/authConstants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/types/api";

export function LoginForm() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    try {
      const res = await loginAdmin(data);
      setTokens(
        {
          accessToken: res.accessToken,
          accessTokenExpiresAt: res.accessTokenExpiresAt
            ? normalizeExpiresAt(res.accessTokenExpiresAt)
            : decodeJwtExpiry(res.accessToken),
        },
        res.admin,
      );
      router.push("/exercises");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong";
      toast.error(message);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600">
            <Dumbbell className="size-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              GymAdmin
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your admin account
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
