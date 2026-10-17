import type { DateRange } from "@/features/analytics/types";

const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatNumber(n: number | null | undefined): string {
  return n == null ? "—" : numberFormat.format(n);
}

export function formatCompact(n: number | null | undefined): string {
  return n == null ? "—" : compactFormat.format(n);
}

export function formatPercent(ratio: number | null | undefined): string {
  return ratio == null ? "—" : `${(ratio * 100).toFixed(1)}%`;
}

export function formatMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`;
}

/** "YYYY-MM-DD" (a UTC day from the API) → "Oct 17". */
export function formatDay(date: string, withYear = false): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear && { year: "numeric" }),
    timeZone: "UTC",
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "3h ago", "5d ago" — for last-active columns. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 60) return `${days}d ago`;
  return formatDate(iso);
}

const STATUS_LABELS: Record<string, string> = {
  success: "Success",
  rate_limited: "Rate limited (429)",
  timeout: "Timeout",
  provider_error: "Provider error",
  bad_output: "Bad output",
  daily_limit: "Daily cap reached",
  not_configured: "Not configured",
};

export function formatAiStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const SKIP_REASON_LABELS: Record<string, string> = {
  weight: "Fewer than 4 weigh-in days",
  workouts: "Under 75% of planned workouts",
  no_plan: "No active plan",
};

export function formatSkipReason(kind: string): string {
  return SKIP_REASON_LABELS[kind] ?? kind;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The `days` UTC days ending today (inclusive) — what the API defaults to. */
export function lastDays(days: number): DateRange {
  const to = todayUtc();
  return { from: shiftDays(to, -(days - 1)), to };
}
