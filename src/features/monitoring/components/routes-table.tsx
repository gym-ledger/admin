"use client";

import { useMemo, useState } from "react";
import { ArrowDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatMs, formatNumber } from "@/features/analytics/utils/format";
import type { RouteStat } from "@/features/monitoring/types";

type SortKey = "requests" | "p50_ms" | "p95_ms" | "p99_ms" | "error_rate_pct";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "requests", label: "Requests" },
  { key: "p50_ms", label: "p50" },
  { key: "p95_ms", label: "p95" },
  { key: "p99_ms", label: "p99" },
  { key: "error_rate_pct", label: "Error rate" },
];

/** Shortens /api/v1/admin/... to /admin/...; every route shares the prefix. */
export function shortRoute(route: string) {
  return route.startsWith("/api/v1/") ? route.slice("/api/v1".length) : route;
}

/** Per-route volume and latency, sortable (descending) by any number column. */
export function RoutesTable({
  routes,
  slowThresholdMs,
  onSelectRoute,
}: {
  routes: RouteStat[];
  slowThresholdMs: number;
  onSelectRoute?: (route: string) => void;
}) {
  const [sort, setSort] = useState<SortKey>("requests");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return routes
      .filter((r) => !q || `${r.method} ${r.route}`.toLowerCase().includes(q))
      .sort((a, b) => (b[sort] ?? -1) - (a[sort] ?? -1));
  }, [routes, sort, search]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-64">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter routes"
          aria-label="Filter routes"
          className="h-8 pl-8 text-sm"
        />
      </div>
      <div className="max-h-[28rem] overflow-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-50">
            <tr className="border-b border-border">
              <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">Route</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setSort(c.key)}
                    className={cn("inline-flex items-center gap-1 hover:text-foreground", sort === c.key && "text-foreground")}
                    aria-label={`Sort by ${c.label}`}
                  >
                    {c.label}
                    {sort === c.key && <ArrowDown className="size-3" />}
                  </button>
                </th>
              ))}
              <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">4xx / 5xx</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs text-muted-foreground">
                  {routes.length === 0 ? "No requests in this window." : "No routes match."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={`${r.method} ${r.route}`}
                  className={cn("border-b border-border last:border-0", onSelectRoute && "cursor-pointer hover:bg-muted/30")}
                  onClick={onSelectRoute ? () => onSelectRoute(r.route) : undefined}
                >
                  <td className="max-w-md px-3 py-2">
                    <span className="mr-2 inline-block w-12 font-mono text-[11px] text-muted-foreground">{r.method}</span>
                    <span className="font-mono text-xs text-foreground">{shortRoute(r.route)}</span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatNumber(r.requests)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatMs(r.p50_ms)}</td>
                  <td className={cn("px-3 py-2 text-right tabular-nums", (r.p95_ms ?? 0) >= slowThresholdMs && "font-semibold text-amber-700")}>
                    {formatMs(r.p95_ms)}
                  </td>
                  <td className={cn("px-3 py-2 text-right tabular-nums", (r.p99_ms ?? 0) >= slowThresholdMs && "font-semibold text-amber-700")}>
                    {formatMs(r.p99_ms)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.error_rate_pct === null ? "—" : `${r.error_rate_pct.toFixed(1)}%`}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {formatNumber(r.client_errors)} / <span className={cn(r.server_errors > 0 && "font-semibold text-red-700")}>{formatNumber(r.server_errors)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Percentiles are estimated from Prometheus histogram buckets. p95/p99 at or above the slow threshold ({formatMs(slowThresholdMs)}) are highlighted.
        {onSelectRoute && " Click a route to see its logged errors and slow requests."}
      </p>
    </div>
  );
}
