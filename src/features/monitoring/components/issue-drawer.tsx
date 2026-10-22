"use client";

import Link from "next/link";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/types/api";
import { formatDateTime, formatMs } from "@/features/analytics/utils/format";
import { StatusBadge } from "@/features/monitoring/components/status-badge";
import { shortRoute } from "@/features/monitoring/components/routes-table";
import { useIssue } from "@/features/monitoring/hooks/use-monitoring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-all text-foreground">{children}</dd>
    </div>
  );
}

/** Slide-over with everything recorded about one failed or slow request. */
export function IssueDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading, isError, error } = useIssue(id);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  return (
    <Sheet open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Request details</SheetTitle>
          <SheetDescription>
            {data ? `${data.method} ${shortRoute(data.route)}` : "Loading…"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-6">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : isError ? (
            <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
          ) : data ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={data.status_code} />
                {data.error_type && <span className="font-mono text-xs text-muted-foreground">{data.error_type}</span>}
                {data.is_slow && (
                  <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800">Slow</span>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="When">{formatDateTime(data.created_at)}</Field>
                <Field label="Duration">{formatMs(data.duration_ms)}</Field>
                <Field label="Path">
                  <span className="font-mono text-xs">{data.path}</span>
                </Field>
                <Field label="Route">
                  <span className="font-mono text-xs">{data.route}</span>
                </Field>
                <Field label="User">
                  {data.user_id ? (
                    <Link href={`/users/${data.user_id}`} className="font-medium text-indigo-700 hover:underline">
                      {data.user_name ?? "View user"}
                    </Link>
                  ) : data.admin_email ? (
                    <span>Admin: {data.admin_email}</span>
                  ) : (
                    <span className="text-muted-foreground">Not signed in</span>
                  )}
                </Field>
                <Field label="Request id">
                  {data.request_id ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="font-mono text-xs">{data.request_id}</span>
                      <Button variant="ghost" size="icon-sm" onClick={() => copy(data.request_id!)} aria-label="Copy request id">
                        <Copy className="size-3.5" />
                      </Button>
                    </span>
                  ) : (
                    "—"
                  )}
                </Field>
              </dl>

              {data.error_message && (
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-medium text-muted-foreground">Error message</h3>
                  <p className="rounded-md border border-border bg-zinc-50 px-3 py-2 text-sm text-foreground">{data.error_message}</p>
                </div>
              )}

              {data.error_stack && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-muted-foreground">Stack trace</h3>
                    <Button variant="ghost" size="sm" onClick={() => copy(data.error_stack!)}>
                      <Copy className="size-3.5" /> Copy
                    </Button>
                  </div>
                  <pre className="max-h-96 overflow-auto rounded-md border border-border bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-foreground">
                    {data.error_stack}
                  </pre>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Search the API logs for the request id to see everything logged while it ran.
              </p>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
