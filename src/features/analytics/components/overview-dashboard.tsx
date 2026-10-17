"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import { useOverview } from "@/features/analytics/hooks/use-analytics";
import {
  ErrorState,
  Panel,
  RangeToolbar,
  StatTile,
} from "@/features/analytics/components/dashboard-parts";
import { StackedBarChart } from "@/features/analytics/components/stacked-bar-chart";
import { DataTable } from "@/features/analytics/components/data-table";
import { formatDay, formatNumber, formatPercent, lastDays } from "@/features/analytics/utils/format";

export function OverviewDashboard() {
  const [days, setDays] = useState(90);
  const range = useMemo(() => lastDays(days), [days]);
  const { data, isLoading, isFetching, isError, error, refetch, isPlaceholderData } = useOverview(range);

  const total = data?.users.total_users ?? 0;
  const share = (n: number | undefined) => (n != null && total > 0 ? formatPercent(n / total) : undefined);

  return (
    <div className="flex flex-col gap-4">
      <RangeToolbar
        days={days}
        onDaysChange={setDays}
        range={range}
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", isPlaceholderData && "opacity-60")}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Total users"
              loading={isLoading}
              value={formatNumber(data?.users.total_users)}
              hint={data ? `${formatNumber(data.users.new_users_in_range)} new in range` : undefined}
            />
            <StatTile
              label="DAU · last 24h"
              loading={isLoading}
              value={formatNumber(data?.active.dau)}
              hint={share(data?.active.dau)}
            />
            <StatTile
              label="WAU · last 7 days"
              loading={isLoading}
              value={formatNumber(data?.active.wau)}
              hint={share(data?.active.wau)}
            />
            <StatTile
              label="MAU · last 30 days"
              loading={isLoading}
              value={formatNumber(data?.active.mau)}
              hint={
                data && data.active.mau > 0
                  ? `Stickiness (DAU/MAU) ${formatPercent(data.active.dau / data.active.mau)}`
                  : share(data?.active.mau)
              }
            />
            <StatTile
              label="Users with an active plan"
              loading={isLoading}
              value={formatNumber(data?.users.users_with_active_plan)}
              hint={share(data?.users.users_with_active_plan)}
            />
            <StatTile
              label="Users with a weight goal"
              loading={isLoading}
              value={formatNumber(data?.users.users_with_goal)}
              hint={share(data?.users.users_with_goal)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Active = completed a workout, logged a weigh-in, or signed in / refreshed a session in the window
            (UTC). Active counts are always measured from now, not from the selected range.
          </p>

          <Panel
            title="New users per week"
            description="Sign-ups per Monday-starting week (UTC)."
            action={
              <Link
                href="/users"
                className="flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline"
              >
                View users <ArrowRight className="size-3" />
              </Link>
            }
          >
            {data ? (
              <>
                <StackedBarChart
                  ariaLabel="New users per week"
                  series={[{ name: "New users", color: "#2a78d6" }]}
                  data={data.new_users_per_week.map((w) => ({
                    label: formatDay(w.week_start),
                    values: [w.count],
                  }))}
                />
                <DataTable
                  summary="Show as table"
                  columns={["Week of", "New users"]}
                  rows={[...data.new_users_per_week].reverse().map((w) => [
                    formatDay(w.week_start, true),
                    formatNumber(w.count),
                  ])}
                />
              </>
            ) : (
              <div className="h-44 animate-pulse rounded-md bg-muted" />
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
