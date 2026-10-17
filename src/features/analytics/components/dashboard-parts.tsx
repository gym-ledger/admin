"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDay, formatNumber } from "@/features/analytics/utils/format";
import type { DateRange } from "@/features/analytics/types";

export const RANGE_PRESETS = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
  { days: 365, label: "Last 12 months" },
] as const;

/** Preset date-range picker plus refresh, for the row above a dashboard. */
export function RangeToolbar({
  days,
  onDaysChange,
  range,
  onRefresh,
  isFetching,
  children,
}: {
  days: number;
  onDaysChange: (days: number) => void;
  range: DateRange;
  onRefresh: () => void;
  isFetching: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={String(days)} onValueChange={(v) => onDaysChange(Number(v))}>
        <SelectTrigger className="w-40" aria-label="Date range">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGE_PRESETS.map((p) => (
            <SelectItem key={p.days} value={String(p.days)}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatDay(range.from, true)} – {formatDay(range.to, true)} (UTC)
      </span>
      {children}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        disabled={isFetching}
        aria-label="Refresh"
        className="ml-auto"
      >
        <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
      </Button>
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-white px-4 py-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className="h-7 w-20" />
      ) : (
        <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </span>
      )}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3 rounded-lg border border-border bg-white p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Ranked list with a proportional bar behind each count. */
export function BreakdownList({
  items,
  formatKey = (k) => k,
  emptyText = "No data in this range.",
}: {
  items: { key: string; count: number; detail?: string }[];
  formatKey?: (key: string) => string;
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="py-4 text-center text-xs text-muted-foreground">{emptyText}</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item.key} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-1 text-sm">
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-indigo-50"
            style={{ width: `${(item.count / max) * 100}%` }}
            aria-hidden
          />
          <span className="relative truncate text-foreground">{formatKey(item.key)}</span>
          <span className="relative shrink-0 tabular-nums text-muted-foreground">
            {item.detail && <span className="mr-2 text-xs">{item.detail}</span>}
            <span className="font-medium text-foreground">{formatNumber(item.count)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-zinc-50 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
        {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-white py-12 text-center">
      <p className="text-sm text-foreground">Couldn&apos;t load this data.</p>
      <p className="text-xs text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
