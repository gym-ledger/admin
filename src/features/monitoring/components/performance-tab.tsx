"use client";

import { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import { BreakdownList, ErrorState, Panel, StatTile } from "@/features/analytics/components/dashboard-parts";
import { StackedBarChart } from "@/features/analytics/components/stacked-bar-chart";
import { DataTable } from "@/features/analytics/components/data-table";
import { formatMs, formatNumber } from "@/features/analytics/utils/format";
import { LineChart } from "@/features/monitoring/components/line-chart";
import { RoutesTable } from "@/features/monitoring/components/routes-table";
import { usePerformance, useRouteStats } from "@/features/monitoring/hooks/use-monitoring";
import type { MetricsWindow, MonitoringStatus } from "@/features/monitoring/types";

const WINDOWS: { value: MetricsWindow; label: string }[] = [
  { value: "1h", label: "Last hour" },
  { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

// Categorical slots 1–3 (validated: blue / orange / aqua). Aqua is under 3:1
// on white, so values are also in the legend, tooltip and table.
const COLOR_P50 = "#2a78d6";
const COLOR_P95 = "#eb6834";
const COLOR_P99 = "#1baf7a";
// Same 4xx/5xx colors as the AI usage page's skipped/failed.
const COLOR_4XX = "#eda100";
const COLOR_5XX = "#e34948";

function formatTime(t: number, range: MetricsWindow) {
  const d = new Date(t);
  return range === "7d" || range === "30d"
    ? d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric" })
    : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatRate(pct: number | null | undefined) {
  return pct == null ? "—" : `${pct.toFixed(pct < 1 ? 2 : 1)}%`;
}

/** Latency percentiles, throughput, error rates and process health, from Prometheus. */
export function PerformanceTab({
  status,
  onSelectRoute,
}: {
  status: MonitoringStatus;
  onSelectRoute: (route: string) => void;
}) {
  const [metricsWindow, setMetricsWindow] = useState<MetricsWindow>("24h");
  const enabled = status.prometheus.configured && status.prometheus.reachable;
  const perf = usePerformance(metricsWindow, enabled);
  const routes = useRouteStats(metricsWindow, enabled);

  if (!enabled) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <div>
          {status.prometheus.configured ? (
            <p>Prometheus isn&apos;t answering, so latency percentiles can&apos;t be shown right now.</p>
          ) : (
            <p>PROMETHEUS_URL isn&apos;t set on the API, so latency percentiles aren&apos;t available.</p>
          )}
          <p className="mt-1 text-xs">
            Errors and slow requests are still logged; see the other tab. Setup: deployment/monitoring/MONITORING.md in the API repo.
          </p>
        </div>
      </div>
    );
  }

  const s = perf.data?.summary;
  const series = perf.data?.series ?? [];
  const xs = series.map((p) => p.t);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={metricsWindow} onValueChange={(v) => setMetricsWindow(v as MetricsWindow)}>
          <SelectTrigger className="w-40" aria-label="Time window">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WINDOWS.map((w) => (
              <SelectItem key={w.value} value={w.value}>
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">Refreshes every minute</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            perf.refetch();
            routes.refetch();
          }}
          disabled={perf.isFetching || routes.isFetching}
          aria-label="Refresh"
          className="ml-auto"
        >
          <RefreshCw className={cn("size-4", (perf.isFetching || routes.isFetching) && "animate-spin")} />
        </Button>
      </div>

      {perf.isError ? (
        <ErrorState message={getErrorMessage(perf.error)} onRetry={() => perf.refetch()} />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", perf.isPlaceholderData && "opacity-60")}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <StatTile label="Requests" loading={perf.isLoading} value={formatNumber(s?.requests)} hint={s && s.aborted > 0 ? `${formatNumber(s.aborted)} aborted by client` : undefined} />
            <StatTile label="p50" loading={perf.isLoading} value={formatMs(s?.p50_ms)} hint="Typical request" />
            <StatTile label="p95" loading={perf.isLoading} value={formatMs(s?.p95_ms)} hint="1 in 20 is slower" />
            <StatTile label="p99" loading={perf.isLoading} value={formatMs(s?.p99_ms)} hint="1 in 100 is slower" />
            <StatTile
              label="4xx rate"
              loading={perf.isLoading}
              value={formatRate(s?.client_error_rate_pct)}
              hint={
                s
                  ? `${formatNumber(s.client_errors)} errors${s.expired_token_401s > 0 ? ` · ${formatNumber(s.expired_token_401s)} expired-token 401s not counted` : ""}`
                  : undefined
              }
            />
            <StatTile
              label="5xx rate"
              loading={perf.isLoading}
              value={
                <span className={cn(s && s.server_errors > 0 && "text-red-700")}>{formatRate(s?.server_error_rate_pct)}</span>
              }
              hint={s ? `${formatNumber(s.server_errors)} server errors` : undefined}
            />
          </div>

          <Panel title="Response time" description="Server time per request, from first middleware to the last byte. Excludes network time and the notification stream.">
            {perf.data ? (
              <>
                <LineChart
                  ariaLabel="Response time percentiles"
                  xs={xs}
                  formatX={(t) => formatTime(t, metricsWindow)}
                  formatValue={formatMs}
                  series={[
                    { name: "p50", color: COLOR_P50, values: series.map((p) => p.p50_ms ?? null) },
                    { name: "p95", color: COLOR_P95, values: series.map((p) => p.p95_ms ?? null) },
                    { name: "p99", color: COLOR_P99, values: series.map((p) => p.p99_ms ?? null) },
                  ]}
                />
                <DataTable
                  summary="Show as table"
                  columns={["Time", "p50", "p95", "p99", "Requests/min"]}
                  rows={[...series].reverse().map((p) => [
                    formatTime(p.t, metricsWindow),
                    formatMs(p.p50_ms),
                    formatMs(p.p95_ms),
                    formatMs(p.p99_ms),
                    formatNumber(p.requests_per_min),
                  ])}
                />
              </>
            ) : (
              <div className="h-44 animate-pulse rounded-md bg-muted" />
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Errors per minute" description="4xx excludes expired-token 401s." className="lg:col-span-2">
              {perf.data ? (
                <>
                  <StackedBarChart
                    ariaLabel="Errors per minute"
                    series={[
                      { name: "4xx", color: COLOR_4XX },
                      { name: "5xx", color: COLOR_5XX },
                    ]}
                    data={series.map((p) => ({
                      label: formatTime(p.t, metricsWindow),
                      values: [p.client_errors_per_min ?? 0, p.server_errors_per_min ?? 0],
                    }))}
                  />
                  <DataTable
                    summary="Show as table"
                    columns={["Time", "Requests/min", "4xx/min", "5xx/min"]}
                    rows={[...series].reverse().map((p) => [
                      formatTime(p.t, metricsWindow),
                      formatNumber(p.requests_per_min),
                      formatNumber(p.client_errors_per_min),
                      formatNumber(p.server_errors_per_min),
                    ])}
                  />
                </>
              ) : (
                <div className="h-44 animate-pulse rounded-md bg-muted" />
              )}
            </Panel>
            <Panel title="Errors by status and type">
              <BreakdownList
                items={(perf.data?.errorsByStatus ?? []).map((e) => ({ key: `${e.status_code} ${e.error_type}`, count: e.count }))}
                emptyText="No errors in this window."
              />
            </Panel>
          </div>

          <Panel title="API process" description="Right now. Event-loop lag over ~100 ms means something is blocking every request.">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-5">
              {[
                ["Event-loop lag p99", formatMs(perf.data?.process.event_loop_lag_p99_ms)],
                ["Heap used", perf.data?.process.heap_used_mb == null ? "—" : `${perf.data.process.heap_used_mb} MB`],
                ["CPU", perf.data?.process.cpu_cores_used == null ? "—" : `${Math.round(perf.data.process.cpu_cores_used * 100)}% of one core`],
                ["Waiting for DB connection", formatNumber(perf.data?.process.db_pool_waiting)],
                ["Requests in flight", formatNumber(perf.data?.process.in_flight)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-medium tabular-nums text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      )}

      <Panel title="Routes" description="Every route that had traffic in this window.">
        {routes.isError ? (
          <ErrorState message={getErrorMessage(routes.error)} onRetry={() => routes.refetch()} />
        ) : routes.data ? (
          <div className={cn("transition-opacity", routes.isPlaceholderData && "opacity-60")}>
            <RoutesTable routes={routes.data.routes} slowThresholdMs={status.slowThresholdMs} onSelectRoute={onSelectRoute} />
          </div>
        ) : (
          <div className="h-44 animate-pulse rounded-md bg-muted" />
        )}
      </Panel>
    </div>
  );
}
