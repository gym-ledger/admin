"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import { BreakdownList, ErrorState, Panel, StatTile } from "@/features/analytics/components/dashboard-parts";
import { StackedBarChart } from "@/features/analytics/components/stacked-bar-chart";
import { DataTable } from "@/features/analytics/components/data-table";
import { formatDay, formatMs, formatNumber, formatRelative, lastDays } from "@/features/analytics/utils/format";
import { IssueDrawer } from "@/features/monitoring/components/issue-drawer";
import { shortRoute } from "@/features/monitoring/components/routes-table";
import { StatusBadge } from "@/features/monitoring/components/status-badge";
import { useIssues, useIssueSummary } from "@/features/monitoring/hooks/use-monitoring";
import type { IssueFilters, MonitoringStatus } from "@/features/monitoring/types";

const COLOR_4XX = "#eda100";
const COLOR_5XX = "#e34948";

const DAY_PRESETS = [
  { days: 1, label: "Today (UTC)" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
];

// Radix Select can't hold an empty value, so "all" stands for no filter.
const ALL = "all";

function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? undefined : v)}>
      <SelectTrigger className={cn("w-40", className)} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{`All ${label.toLowerCase()}`}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** The Postgres log of failed and slow requests: summary, breakdowns and a drill-down table. */
export function IssuesTab({
  status,
  route,
  onRouteChange,
}: {
  status: MonitoringStatus;
  route: string | undefined;
  onRouteChange: (route: string | undefined) => void;
}) {
  const [days, setDays] = useState(7);
  const [kind, setKind] = useState<IssueFilters["kind"]>();
  const [statusClass, setStatusClass] = useState<IssueFilters["statusClass"]>();
  const [errorType, setErrorType] = useState<string>();
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const filters = useMemo<IssueFilters>(
    () => ({ ...lastDays(days), kind, statusClass, errorType, route }),
    [days, kind, statusClass, errorType, route],
  );
  const summary = useIssueSummary(filters);
  const list = useIssues(filters, page);
  const s = summary.data;
  const meta = list.data?.meta;
  const rows = list.data?.data ?? [];
  const filtered = Boolean(kind || statusClass || errorType || route);

  // Any filter change starts again from page 1.
  function update<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(days)} onValueChange={(v) => update(setDays)(Number(v))}>
          <SelectTrigger className="w-40" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAY_PRESETS.map((p) => (
              <SelectItem key={p.days} value={String(p.days)}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FilterSelect
          label="Kinds"
          value={kind}
          onChange={update((v) => setKind(v as IssueFilters["kind"]))}
          options={[
            { value: "error", label: "Errors" },
            { value: "slow", label: `Slow (≥ ${formatMs(status.slowThresholdMs)})` },
          ]}
          className="w-44"
        />
        <FilterSelect
          label="Statuses"
          value={statusClass}
          onChange={update((v) => setStatusClass(v as IssueFilters["statusClass"]))}
          options={[
            { value: "4xx", label: "4xx client errors" },
            { value: "5xx", label: "5xx server errors" },
          ]}
        />
        <FilterSelect
          label="Types"
          value={errorType}
          onChange={update(setErrorType)}
          options={(s?.facets.errorTypes ?? []).map((t) => ({ value: t, label: t }))}
          className="w-48"
        />
        <FilterSelect
          label="Routes"
          value={route}
          onChange={update(onRouteChange)}
          options={[...new Set([...(s?.facets.routes ?? []), ...(route ? [route] : [])])].map((r) => ({ value: r, label: shortRoute(r) }))}
          className="w-72"
        />
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setKind(undefined);
              setStatusClass(undefined);
              setErrorType(undefined);
              onRouteChange(undefined);
              setPage(1);
            }}
          >
            <X className="size-3.5" /> Clear filters
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            summary.refetch();
            list.refetch();
          }}
          disabled={summary.isFetching || list.isFetching}
          aria-label="Refresh"
          className="ml-auto"
        >
          <RefreshCw className={cn("size-4", (summary.isFetching || list.isFetching) && "animate-spin")} />
        </Button>
      </div>

      {summary.isError ? (
        <ErrorState message={getErrorMessage(summary.error)} onRetry={() => summary.refetch()} />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", summary.isPlaceholderData && "opacity-60")}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatTile label="Errors" loading={summary.isLoading} value={formatNumber(s?.totals.errors)} />
            <StatTile
              label="Server errors (5xx)"
              loading={summary.isLoading}
              value={<span className={cn(s && s.totals.server_errors > 0 && "text-red-700")}>{formatNumber(s?.totals.server_errors)}</span>}
            />
            <StatTile label="Client errors (4xx)" loading={summary.isLoading} value={formatNumber(s?.totals.client_errors)} hint="Unknown URLs (404s from scanners) aren't logged" />
            <StatTile label="Slow requests" loading={summary.isLoading} value={formatNumber(s?.totals.slow)} hint={`≥ ${formatMs(status.slowThresholdMs)}`} />
            <StatTile label="Users affected" loading={summary.isLoading} value={formatNumber(s?.totals.users_affected)} hint="Signed-in users only" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Errors per day" description="UTC days." className="lg:col-span-2">
              {s ? (
                <>
                  <StackedBarChart
                    ariaLabel="Errors per day"
                    series={[
                      { name: "4xx", color: COLOR_4XX },
                      { name: "5xx", color: COLOR_5XX },
                    ]}
                    data={s.perDay.map((d) => ({ label: formatDay(d.day), values: [d.client_errors, d.server_errors] }))}
                  />
                  <DataTable
                    summary="Show as table"
                    columns={["Day", "4xx", "5xx", "Slow"]}
                    rows={[...s.perDay].reverse().map((d) => [
                      formatDay(d.day, true),
                      formatNumber(d.client_errors),
                      formatNumber(d.server_errors),
                      formatNumber(d.slow),
                    ])}
                  />
                </>
              ) : (
                <div className="h-44 animate-pulse rounded-md bg-muted" />
              )}
            </Panel>
            <Panel title="By status">
              <BreakdownList
                items={(s?.byStatus ?? []).map((b) => ({ key: String(b.status_code), count: b.count }))}
                emptyText="No errors in this range."
              />
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="By error type">
              <BreakdownList
                items={(s?.byErrorType ?? []).map((b) => ({ key: b.error_type ?? "—", count: b.count }))}
                emptyText="No errors in this range."
              />
            </Panel>
            <Panel title="Top routes" description="Most logged errors and slow requests." className="lg:col-span-2">
              <BreakdownList
                items={(s?.byRoute ?? []).map((b) => ({
                  key: `${b.method} ${b.route}`,
                  count: b.errors + b.slow,
                  detail: `${formatNumber(b.errors)} errors · ${formatNumber(b.slow)} slow · max ${formatMs(b.max_duration_ms)}`,
                }))}
                formatKey={(k) => {
                  const [method, ...rest] = k.split(" ");
                  return `${method} ${shortRoute(rest.join(" "))}`;
                }}
                emptyText="Nothing logged in this range."
              />
            </Panel>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2 className="text-sm font-semibold text-foreground">Requests</h2>
          {meta && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatNumber(meta.totalCount)} logged · kept {status.retentionDays} days
            </span>
          )}
        </div>
        <div className="max-h-[36rem] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-zinc-50">
                {["When", "Status", "Route", "Duration", "Type", "Message", "Who"].map((h, i) => (
                  <th
                    key={h}
                    className={cn("h-9 whitespace-nowrap px-3 text-xs font-medium text-muted-foreground", i === 3 ? "text-right" : "text-left")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={cn("transition-opacity", list.isPlaceholderData && "opacity-60")}>
              {list.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2" colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : list.isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    Couldn&apos;t load requests: {getErrorMessage(list.error)}{" "}
                    <button type="button" className="font-medium text-indigo-700 hover:underline" onClick={() => list.refetch()}>
                      Try again
                    </button>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    {filtered ? "No logged requests match these filters." : "No errors or slow requests in this range."}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    tabIndex={0}
                    onClick={() => setOpenId(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenId(r.id);
                      }
                    }}
                    className="cursor-pointer border-b border-border outline-none transition-colors last:border-0 hover:bg-muted/30 focus-visible:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground" title={new Date(r.created_at).toLocaleString()}>
                      {formatRelative(r.created_at)}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={r.status_code} />
                    </td>
                    <td className="max-w-80 px-3 py-2">
                      <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">{r.method}</span>
                      <span className="truncate font-mono text-xs text-foreground">{shortRoute(r.route)}</span>
                    </td>
                    <td className={cn("whitespace-nowrap px-3 py-2 text-right tabular-nums", r.is_slow && "font-semibold text-amber-700")}>
                      {formatMs(r.duration_ms)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted-foreground">{r.error_type ?? "—"}</td>
                    <td className="max-w-72 truncate px-3 py-2 text-xs text-foreground" title={r.error_message ?? undefined}>
                      {r.error_message ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                      {r.user_id ? "User" : r.admin_user_id ? "Admin" : "Anonymous"}
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
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || list.isFetching}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages || list.isFetching}
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <IssueDrawer id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
