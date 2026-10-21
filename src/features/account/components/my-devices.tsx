"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import { Panel } from "@/features/analytics/components/dashboard-parts";
import { formatDate, formatDateTime, formatNumber, formatRelative } from "@/features/analytics/utils/format";
import {
  useActiveSessions,
  useAllSessions,
  useSignOutOtherSessions,
  useSignOutSession,
} from "@/features/account/hooks/use-account";
import { DeviceIcon, deviceName, sessionLocation, sessionStatusLabel } from "@/features/account/components/device-details";
import type { AdminSession, SessionScope } from "@/features/account/types";

const PAGE_SIZE = 20;

/** "1.2.3.4", or "1.2.3.4 (signed in from 5.6.7.8)" when it changed since sign-in. */
function ipText(s: AdminSession): string | null {
  const last = s.last_ip_address ?? s.ip_address;
  if (!last) return null;
  return s.ip_address && s.ip_address !== last ? `${last} (signed in from ${s.ip_address})` : last;
}

function SignOutButton({ session }: { session: AdminSession }) {
  const signOut = useSignOutSession();
  if (session.current || session.status !== "active") return null;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut.mutate(session.id)}
      disabled={signOut.isPending}
      aria-label={`Sign out ${deviceName(session)}`}
    >
      {signOut.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
      Sign out
    </Button>
  );
}

function ActiveList({ sessions, max }: { sessions: AdminSession[]; max: number }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {sessions.map((s) => {
        const location = sessionLocation(s);
        const ip = ipText(s);
        return (
          <li key={s.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <DeviceIcon type={s.device_type} className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                {deviceName(s)}
                {s.current && <Badge variant="secondary">This device</Badge>}
              </p>
              <p className="text-xs text-muted-foreground">
                {[location, ip ? `IP ${ip}` : null].filter(Boolean).join(" · ") || "Location unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                Signed in {formatDateTime(s.created_at)} · Last active{" "}
                <span title={formatDateTime(s.last_used_at)}>{s.current ? "now" : formatRelative(s.last_used_at)}</span>{" "}
                · Expires {formatDate(s.expires_at)}
              </p>
              {s.user_agent && (
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/80" title={s.user_agent}>
                  {s.user_agent}
                </p>
              )}
            </div>
            <SignOutButton session={s} />
          </li>
        );
      })}
      {sessions.length === 0 && (
        <li className="py-6 text-center text-sm text-muted-foreground">No active sessions.</li>
      )}
      <li className="sr-only">
        {sessions.length} of {max} sessions in use
      </li>
    </ul>
  );
}

function AllSessionsTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch, isPlaceholderData } = useAllSessions(page, PAGE_SIZE);
  const rows = data?.data ?? [];
  const meta = data?.meta;
  const headers = ["Device", "Location & IP", "Signed in", "Last active", "Status", ""];

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-zinc-50">
              {headers.map((h, i) => (
                <th key={i} className="h-9 whitespace-nowrap px-3 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5" colSpan={headers.length}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={headers.length} className="py-10 text-center text-sm text-muted-foreground">
                  Couldn&apos;t load sessions: {getErrorMessage(error)}{" "}
                  <button type="button" className="font-medium text-indigo-700 hover:underline" onClick={() => refetch()}>
                    Try again
                  </button>
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="max-w-64 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <DeviceIcon type={s.device_type} className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-foreground" title={s.user_agent ?? undefined}>
                        {deviceName(s)}
                      </span>
                      {s.current && <Badge variant="secondary">This device</Badge>}
                    </div>
                  </td>
                  <td className="max-w-64 px-3 py-2.5 text-xs text-muted-foreground">
                    <span className="block truncate">{sessionLocation(s) ?? "—"}</span>
                    <span className="block truncate tabular-nums">{ipText(s) ?? "—"}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                    {formatDateTime(s.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground" title={formatDateTime(s.last_used_at)}>
                    {formatRelative(s.last_used_at)}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    <span className={cn(s.status === "active" ? "font-medium text-emerald-700" : "text-muted-foreground")}>
                      {sessionStatusLabel(s)}
                    </span>
                    {s.ended_at && (
                      <span className="block tabular-nums text-muted-foreground">{formatDateTime(s.ended_at)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <SignOutButton session={s} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {formatNumber(meta.totalCount)} sign-ins
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages || isFetching}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Settings > My Devices: the active sign-ins by default, or every sign-in
 * ever (ended and expired too) as a paginated table.
 */
export function MyDevices() {
  const [scope, setScope] = useState<SessionScope>("active");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const active = useActiveSessions();
  const signOutOthers = useSignOutOtherSessions();

  const sessions = active.data?.data ?? [];
  const max = active.data?.meta.max_active_sessions ?? 5;
  const others = sessions.filter((s) => !s.current).length;

  const scopes: { value: SessionScope; label: string }[] = [
    { value: "active", label: active.data ? `Active (${sessions.length} of ${max})` : "Active" },
    { value: "all", label: "All sessions" },
  ];

  return (
    <Panel
      title="My Devices"
      description={`Where you're signed in. Up to ${max} devices at once; signing in on another signs out the one used least recently.`}
      action={
        <div className="flex items-center gap-2">
          <div role="tablist" aria-label="Sessions to show" className="flex rounded-lg border border-border p-0.5">
            {scopes.map((s) => (
              <button
                key={s.value}
                type="button"
                role="tab"
                aria-selected={scope === s.value}
                onClick={() => setScope(s.value)}
                className={cn(
                  "h-7 whitespace-nowrap rounded-md px-2.5 text-xs font-medium transition-colors",
                  scope === s.value ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          {scope === "active" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => active.refetch()}
              disabled={active.isFetching}
              aria-label="Refresh"
            >
              <RefreshCw className={cn("size-4", active.isFetching && "animate-spin")} />
            </Button>
          )}
        </div>
      }
    >
      {scope === "all" ? (
        <AllSessionsTable />
      ) : active.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : active.isError ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Couldn&apos;t load your devices: {getErrorMessage(active.error)}{" "}
          <button type="button" className="font-medium text-indigo-700 hover:underline" onClick={() => active.refetch()}>
            Try again
          </button>
        </p>
      ) : (
        <>
          <ActiveList sessions={sessions} max={max} />
          {others > 0 && (
            <div className="border-t border-border pt-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
                <LogOut className="size-3.5" />
                Sign out all other devices
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Sign out all other devices?</DialogTitle>
            <DialogDescription>
              {others === 1 ? "1 other device" : `${others} other devices`} will need your password to sign in again.
              This device stays signed in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={signOutOthers.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await signOutOthers.mutateAsync().catch(() => undefined);
                setConfirmOpen(false);
              }}
              disabled={signOutOthers.isPending}
            >
              {signOutOthers.isPending && <Loader2 className="size-4 animate-spin" />}
              Sign out others
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
