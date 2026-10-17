"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import {
  useAiDaily,
  useAiSummary,
  useCheckinOutcomes,
} from "@/features/analytics/hooks/use-analytics";
import {
  BreakdownList,
  ErrorState,
  Panel,
  RangeToolbar,
  StatTile,
} from "@/features/analytics/components/dashboard-parts";
import { StackedBarChart } from "@/features/analytics/components/stacked-bar-chart";
import { DataTable } from "@/features/analytics/components/data-table";
import {
  formatAiStatus,
  formatCompact,
  formatDay,
  formatMs,
  formatNumber,
  formatPercent,
  formatSkipReason,
  lastDays,
} from "@/features/analytics/utils/format";

// Validated categorical slots (blue / yellow / red); yellow is below 3:1 on
// white, so every chart here also has a table view.
const COLOR_OK = "#2a78d6";
const COLOR_SKIPPED = "#eda100";
const COLOR_FAILED = "#e34948";

export function AiUsageDashboard() {
  const [days, setDays] = useState(30);
  const range = useMemo(() => lastDays(days), [days]);

  const summary = useAiSummary(range);
  const daily = useAiDaily(range);
  const checkins = useCheckinOutcomes(range);
  const isFetching = summary.isFetching || daily.isFetching || checkins.isFetching;

  function refetchAll() {
    summary.refetch();
    daily.refetch();
    checkins.refetch();
  }

  const s = summary.data;
  const budgetUsed = s?.today.budget_counter ?? s?.today.budget_used ?? 0;
  const budgetShare = s && s.config.daily_limit > 0 ? Math.min(1, budgetUsed / s.config.daily_limit) : 0;

  return (
    <div className="flex flex-col gap-4">
      <RangeToolbar
        days={days}
        onDaysChange={setDays}
        range={range}
        onRefresh={refetchAll}
        isFetching={isFetching}
      />

      {summary.isError ? (
        <ErrorState message={getErrorMessage(summary.error)} onRetry={() => summary.refetch()} />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", summary.isPlaceholderData && "opacity-60")}>
          {s && !s.config.configured && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                GROQ_API_KEY isn&apos;t set on the API, so no model calls are made. Check-ins show their numbers without a written note.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatTile
              label="Today (UTC) vs daily cap"
              loading={summary.isLoading}
              value={
                s ? (
                  <>
                    {formatNumber(budgetUsed)}
                    <span className="text-sm font-normal text-muted-foreground"> / {formatNumber(s.config.daily_limit)}</span>
                  </>
                ) : "—"
              }
              hint={
                <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span
                    className={cn("block h-full rounded-full", budgetShare >= 0.9 ? "bg-red-500" : budgetShare >= 0.7 ? "bg-amber-500" : "bg-indigo-500")}
                    style={{ width: `${budgetShare * 100}%` }}
                  />
                </span>
              }
            />
            <StatTile
              label="Calls in range"
              loading={summary.isLoading}
              value={formatNumber(s?.totals.calls)}
              hint={s ? `${formatNumber(s.today.calls)} today` : undefined}
            />
            <StatTile
              label="Success rate"
              loading={summary.isLoading}
              value={formatPercent(s?.totals.success_rate)}
              hint={s ? `${formatNumber(s.totals.success)} succeeded` : undefined}
            />
            <StatTile
              label="Tokens"
              loading={summary.isLoading}
              value={formatCompact(s?.totals.total_tokens)}
              hint={s ? `${formatCompact(s.totals.prompt_tokens)} in · ${formatCompact(s.totals.completion_tokens)} out` : undefined}
            />
            <StatTile
              label="Latency p50 / p95"
              loading={summary.isLoading}
              value={s ? `${formatMs(s.totals.latency_p50_ms)}` : "—"}
              hint={s ? `p95 ${formatMs(s.totals.latency_p95_ms)}` : undefined}
            />
          </div>
        </div>
      )}

      <Panel
        title="Model calls per day"
        description="Every attempted Groq call, by UTC day. Failed = any status other than success."
      >
        {daily.isError ? (
          <ErrorState message={getErrorMessage(daily.error)} onRetry={() => daily.refetch()} />
        ) : daily.data ? (
          <div className={cn("transition-opacity", daily.isPlaceholderData && "opacity-60")}>
            <StackedBarChart
              ariaLabel="Model calls per day"
              series={[
                { name: "Success", color: COLOR_OK },
                { name: "Failed", color: COLOR_FAILED },
              ]}
              data={daily.data.days.map((d) => ({
                label: formatDay(d.date),
                values: [d.success, d.failed],
              }))}
            />
            <DataTable
              summary="Show as table"
              columns={["Day", "Calls", "Success", "Failed", "Tokens"]}
              rows={[...daily.data.days].reverse().map((d) => [
                formatDay(d.date, true),
                formatNumber(d.total),
                formatNumber(d.success),
                formatNumber(d.failed),
                formatNumber(d.tokens),
              ])}
            />
          </div>
        ) : (
          <div className="h-44 animate-pulse rounded-md bg-muted" />
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="By status">
          <BreakdownList
            items={(s?.by_status ?? []).map((i) => ({ key: i.key, count: i.count }))}
            formatKey={formatAiStatus}
          />
        </Panel>
        <Panel title="By feature">
          <BreakdownList
            items={(s?.by_feature ?? []).map((i) => ({ key: i.key, count: i.count, detail: `${formatCompact(i.tokens)} tok` }))}
          />
        </Panel>
        <Panel title="By model">
          <BreakdownList
            items={(s?.by_model ?? []).map((i) => ({ key: i.key, count: i.count, detail: `${formatCompact(i.tokens)} tok` }))}
          />
        </Panel>
      </div>

      <Panel
        title="Weekly check-in outcomes"
        description="Per check-in week (Monday start). Skipped = the data gate blocked the model call; no call was made."
        action={
          checkins.data ? (
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatNumber(checkins.data.totals.users)} users · {formatNumber(checkins.data.totals.attempts)} model attempts
            </span>
          ) : null
        }
      >
        {checkins.isError ? (
          <ErrorState message={getErrorMessage(checkins.error)} onRetry={() => checkins.refetch()} />
        ) : checkins.data ? (
          <div className={cn("grid gap-6 lg:grid-cols-[2fr_1fr]", checkins.isPlaceholderData && "opacity-60")}>
            <div>
              <StackedBarChart
                ariaLabel="Weekly check-in outcomes"
                series={[
                  { name: "Ready", color: COLOR_OK },
                  { name: "Skipped", color: COLOR_SKIPPED },
                  { name: "Failed", color: COLOR_FAILED },
                ]}
                data={checkins.data.weeks.map((w) => ({
                  label: formatDay(w.week_start),
                  values: [w.ready, w.skipped, w.failed],
                }))}
              />
              <DataTable
                summary="Show as table"
                columns={["Week of", "Ready", "Skipped", "Failed", "Pending"]}
                rows={[...checkins.data.weeks].reverse().map((w) => [
                  formatDay(w.week_start, true),
                  formatNumber(w.ready),
                  formatNumber(w.skipped),
                  formatNumber(w.failed),
                  formatNumber(w.pending),
                ])}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-medium text-muted-foreground">Most common skip reasons</h3>
              <BreakdownList
                items={checkins.data.skip_reasons.map((r) => ({
                  key: r.kind,
                  count: r.count,
                  detail: r.long_inactive > 0 ? `${formatNumber(r.long_inactive)} inactive 60d+` : undefined,
                }))}
                formatKey={formatSkipReason}
                emptyText="No skipped weeks in this range."
              />
              <p className="text-xs text-muted-foreground">
                A skipped week can have more than one reason.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-44 animate-pulse rounded-md bg-muted" />
        )}
      </Panel>
    </div>
  );
}
