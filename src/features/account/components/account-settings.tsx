"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/types/api";
import { ErrorState, Panel } from "@/features/analytics/components/dashboard-parts";
import { formatDate, formatRelative } from "@/features/analytics/utils/format";
import { useAccount } from "@/features/account/hooks/use-account";
import { ChangePasswordForm } from "@/features/account/components/change-password-form";
import { MyDevices } from "@/features/account/components/my-devices";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function AccountSettings() {
  const { data, isLoading, isError, error, refetch } = useAccount();

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  return (
    <div className="flex max-w-5xl flex-col gap-4">
      <Panel title="Account" description="The admin account you're signed in with.">
        {isLoading || !data ? (
          <Skeleton className="h-10 w-full max-w-md" />
        ) : (
          <dl className="grid gap-4 sm:grid-cols-3">
            <Field label="Email">{data.admin.email}</Field>
            <Field label="Admin since">{formatDate(data.admin.created_at)}</Field>
            <Field label="Password last changed">
              {data.admin.password_changed_at ? formatRelative(data.admin.password_changed_at) : "Never"}
            </Field>
          </dl>
        )}
      </Panel>

      <Panel title="Password" description="Use a long password you don't use anywhere else.">
        <ChangePasswordForm minLength={data?.password_min_length ?? 12} />
      </Panel>

      <MyDevices />
    </div>
  );
}
