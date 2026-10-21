"use client";

import Link from "next/link";
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, Minus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import { useDashboard } from "@/features/analytics/hooks/use-analytics";
import { BreakdownList, ErrorState, Panel, StatTile } from "@/features/analytics/components/dashboard-parts";
import { StackedBarChart } from "@/features/analytics/components/stacked-bar-chart";
import { DataTable } from "@/features/analytics/components/data-table";
import { formatDay, formatNumber, formatPercent, formatRelative } from "@/features/analytics/utils/format";
import type { Dashboard, DashboardPulse } from "@/features/analytics/types";

const PULSE_TILES: { key: keyof DashboardPulse; label: string }[] = [
  { key: "workouts", label: "Workouts completed" },
  { key: "sets", label: "Sets logged" },
  { key: "active_users", label: "Users who trained" },
  { key: "weigh_ins", label: "Weigh-ins" },
  { key: "new_users", label: "New users" },
];

/** "▲ 25% vs previous 7 days" — direction carried by the arrow and the sign, not by colour alone. */
function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return <span>{current > 0 ? "New this week" : "None in the previous 7 days"}</span>;
  }
  const change = (current - previous) / previous;
  const Icon = change > 0.005 ? ArrowUpRight : change < -0.005 ? ArrowDownRight : Minus;
  return (
    <span className="inline-flex items-center gap-0.5">
      <Icon className="size-3" aria-hidden />
      {change > 0 ? "+" : ""}
      {formatPercent(change)} vs previous 7 days ({formatNumber(previous)})
    </span>
  );
}

interface AttentionItem {
  key: string;
  label: string;
  count: number;
  href: string;
  /** Shown even at zero, as a status line. */
  always?: boolean;
  detail?: string;
}

function attentionItems(data: Dashboard): AttentionItem[] {
  const { content, attention } = data;
  const items: AttentionItem[] = [
    {
      key: "no-muscles",
      label: "Exercises without muscles mapped",
      detail: "Muscle signals and the body map skip them",
      count: content.exercises_without_muscles,
      href: "/exercises",
    },
    {
      key: "no-image",
      label: "Exercises without an image",
      count: content.exercises_without_image,
      href: "/exercises",
    },
    {
      key: "no-version",
      label: "Programs without a version",
      detail: "Users can't start them",
      count: content.programs_without_version,
      href: "/programs",
    },
    {
      key: "checkins",
      label: "Weekly check-ins failed (7 days)",
      count: attention.checkins_failed_7d,
      href: "/ai-usage",
    },
    {
      key: "ai-failures",
      label: "AI calls not successful (24 h)",
      detail: attention.ai_calls_24h > 0 ? `of ${formatNumber(attention.ai_calls_24h)} calls` : undefined,
      count: attention.ai_failures_24h,
      href: "/ai-usage",
    },
  ];
  return items.filter((item) => item.count > 0 || item.always);
}

export function DashboardHome() {
  const { data, isLoading, isFetching, isError, error, refetch } = useDashboard();

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  const issues = data ? attentionItems(data) : [];
  const budget = data?.attention;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">
          Last 7 days against the 7 before{data && ` · updated ${formatRelative(data.generated_at)}`}
        </p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh"
          className="ml-auto"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {PULSE_TILES.map((tile) => (
          <StatTile
            key={tile.key}
            label={tile.label}
            loading={isLoading}
            value={formatNumber(data?.pulse.current[tile.key])}
            hint={data ? <Delta current={data.pulse.current[tile.key]} previous={data.pulse.previous[tile.key]} /> : undefined}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Workouts per day"
          description="Completed workouts per UTC day, last 30 days."
          action={
            <Link href="/analytics" className="flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline">
              Analytics <ArrowRight className="size-3" />
            </Link>
          }
        >
          {data ? (
            <>
              <StackedBarChart
                ariaLabel="Completed workouts per day"
                series={[{ name: "Workouts", color: "#2a78d6" }]}
                data={data.workouts_per_day.map((d) => ({ label: formatDay(d.date), values: [d.workouts] }))}
              />
              <DataTable
                summary="Show as table"
                columns={["Day", "Workouts", "Users who trained"]}
                rows={[...data.workouts_per_day].reverse().map((d) => [
                  formatDay(d.date, true),
                  formatNumber(d.workouts),
                  formatNumber(d.users),
                ])}
              />
            </>
          ) : (
            <div className="h-44 animate-pulse rounded-md bg-muted" />
          )}
        </Panel>

        <Panel title="Needs attention" description="Things an admin can fix.">
          {!data ? (
            <div className="h-44 animate-pulse rounded-md bg-muted" />
          ) : (
            <div className="flex flex-col gap-3">
              {issues.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                  All clear
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {issues.map((item) => (
                    <li key={item.key}>
                      <Link href={item.href} className="flex items-start gap-2 py-2 text-sm hover:underline">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                        <span className="flex-1">
                          <span className="text-foreground">{item.label}</span>
                          {item.detail && <span className="block text-xs text-muted-foreground">{item.detail}</span>}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">{formatNumber(item.count)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {budget && (
                <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                  {budget.ai_configured ? (
                    <>
                      AI calls today:{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {budget.ai_budget_used_today == null ? "unknown" : formatNumber(budget.ai_budget_used_today)}
                      </span>{" "}
                      of {formatNumber(budget.ai_daily_limit)} daily limit
                    </>
                  ) : (
                    "AI check-ins are off (no GROQ_API_KEY). Check-ins show numbers only."
                  )}
                </div>
              )}

              <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                Library:{" "}
                <Link href="/exercises" className="font-medium text-foreground hover:underline">
                  {formatNumber(data.content.exercises)} exercises
                </Link>
                {" · "}
                <Link href="/muscles" className="font-medium text-foreground hover:underline">
                  {formatNumber(data.content.muscles)} muscles
                </Link>
                {" · "}
                <Link href="/programs" className="font-medium text-foreground hover:underline">
                  {formatNumber(data.content.programs)} programs
                </Link>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Most-followed programs" description="Users on each system program now, own copies included.">
          {data ? (
            <BreakdownList
              items={data.top_programs.map((p) => ({ key: p.name, count: p.active_users }))}
              emptyText="No one is following a program yet."
            />
          ) : (
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          )}
        </Panel>

        <Panel title="Most-logged exercises" description="Working sets, last 30 days.">
          {data ? (
            <BreakdownList
              items={data.top_exercises.map((e) => ({
                key: e.name,
                count: e.sets,
                detail: `${formatNumber(e.users)} ${e.users === 1 ? "user" : "users"}`,
              }))}
              emptyText="No sets logged in the last 30 days."
            />
          ) : (
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          )}
        </Panel>

        <Panel
          title="Recent sign-ups"
          action={
            <Link href="/users" className="flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline">
              All users <ArrowRight className="size-3" />
            </Link>
          }
        >
          {data ? (
            data.recent_signups.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No users yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {data.recent_signups.map((u) => (
                  <li key={u.id}>
                    <Link href={`/users/${u.id}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:underline">
                      <span className="min-w-0">
                        <span className="block truncate text-foreground">{u.name ?? u.email ?? u.phone ?? "Unnamed user"}</span>
                        <span className="block text-xs text-muted-foreground">
                          {u.onboarded ? "Onboarded" : "Not onboarded yet"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(u.created_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          )}
        </Panel>
      </div>
    </div>
  );
}
