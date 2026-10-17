"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getErrorMessage } from "@/types/api";
import { useUser } from "@/features/users/hooks/use-users";
import type { UserDetail as UserDetailData } from "@/features/users/types";
import {
  ErrorState,
  PageHeader,
  Panel,
  StatTile,
} from "@/features/analytics/components/dashboard-parts";
import { WeightTrendChart } from "@/features/users/components/weight-trend-chart";
import {
  formatAiStatus,
  formatDate,
  formatDateTime,
  formatDay,
  formatMs,
  formatNumber,
  formatRelative,
  formatSkipReason,
} from "@/features/analytics/utils/format";

const CHECKIN_STATUS: Record<UserDetailData["checkins"][number]["status"], { label: string; className: string }> = {
  ready: { label: "Ready", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  skipped: { label: "Skipped", className: "border-zinc-200 bg-zinc-50 text-zinc-700" },
  failed: { label: "Failed", className: "border-red-200 bg-red-50 text-red-700" },
  pending: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-800" },
};

const GOAL_LABELS: Record<string, string> = {
  lose: "Lose weight",
  maintain: "Maintain",
  gain: "Gain weight",
  mild_cut: "Mild cut",
  extreme_cut: "Extreme cut",
  clean_bulk: "Clean bulk",
  dirty_bulk: "Dirty bulk",
  custom: "Custom pace",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-all text-sm text-foreground">{children ?? "—"}</dd>
    </div>
  );
}

function SimpleTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="py-4 text-center text-xs text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => (
              <th key={c} className="h-8 whitespace-nowrap px-2 text-left text-xs font-medium text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="whitespace-nowrap px-2 py-1.5 tabular-nums">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/users"
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      All users
    </Link>
  );
}

export function UserDetail({ id }: { id: string }) {
  const { data, isLoading, isError, error, refetch } = useUser(id);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <PageHeader title="User">
          <BackLink />
        </PageHeader>
        <div className="flex flex-col gap-4 px-6 py-5">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return (
      <div className="flex flex-col">
        <PageHeader title="User">
          <BackLink />
        </PageHeader>
        <div className="px-6 py-5">
          {notFound ? (
            <p className="py-16 text-center text-sm text-muted-foreground">This user doesn&apos;t exist or was deleted.</p>
          ) : (
            <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
          )}
        </div>
      </div>
    );
  }

  const { user, activity, goal, plans, recent_workouts, weight_trend, checkins, ai_requests } = data;
  const units = user.weight_units ?? "kg";

  return (
    <div className="flex flex-col">
      <PageHeader title={user.name ?? "No name"} description="Read-only view">
        <BackLink />
      </PageHeader>

      <div className="flex flex-col gap-4 px-6 py-5">
        <Panel title="Account">
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Field label="Email">{user.email}</Field>
            <Field label="Phone">{user.phone}</Field>
            <Field label="Signed up">{formatDateTime(activity.created_at)}</Field>
            <Field label="Last active">
              {activity.last_active_at ? (
                <span title={formatDateTime(activity.last_active_at)}>{formatRelative(activity.last_active_at)}</span>
              ) : (
                "Never"
              )}
            </Field>
            <Field label="Timezone · units">
              {user.timezone ? `${user.timezone} · ${units}` : null}
            </Field>
          </dl>
        </Panel>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatTile label="Workouts · 7 days" value={formatNumber(activity.workouts_7d)} />
          <StatTile label="Workouts · 30 days" value={formatNumber(activity.workouts_30d)} />
          <StatTile label="Weigh-in days · 30 days" value={formatNumber(activity.weigh_in_days_30d)} />
          <StatTile label="Active plan" value={activity.has_active_plan ? "Yes" : "No"} />
          <StatTile label="AI calls · 12 months" value={formatNumber(activity.ai_calls)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Panel title="Body weight" description="Weigh-ins over the last 180 days">
            <WeightTrendChart points={weight_trend} units={units} />
          </Panel>
          <Panel title="Goal and plans">
            <dl className="grid grid-cols-2 gap-3">
              <Field label="Goal">{goal ? GOAL_LABELS[goal.weight_goal] : "Not set"}</Field>
              <Field label="Pace">{goal?.preset ? GOAL_LABELS[goal.preset] ?? goal.preset : goal ? "—" : null}</Field>
              <Field label="Target">{goal?.target_weight != null ? `${goal.target_weight} ${units}` : goal ? "—" : null}</Field>
              <Field label="Goal date">{goal?.goal_date ? formatDay(goal.goal_date, true) : goal ? "—" : null}</Field>
            </dl>
            <div className="mt-1 border-t border-border pt-3">
              {plans.length === 0 ? (
                <p className="text-xs text-muted-foreground">No plans assigned.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {plans.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">
                        {p.program_name} <span className="text-xs text-muted-foreground">v{p.version_number}</span>
                      </span>
                      {p.is_active ? (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 font-normal text-emerald-800">
                          Active
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">{formatDate(p.started_at ?? p.created_at)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        </div>

        <Panel title="Recent workouts" description="Latest 20, newest first">
          <SimpleTable
            columns={["Started", "Completed", "Plan", "Working sets"]}
            empty="No workouts logged."
            rows={recent_workouts.map((w) => [
              formatDateTime(w.started_at),
              w.completed_at ? formatDateTime(w.completed_at) : <span className="text-muted-foreground">Not completed</span>,
              w.program_name ?? "—",
              formatNumber(w.working_sets),
            ])}
          />
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Weekly check-ins" description="Status only; the written note isn't shown here">
            <SimpleTable
              columns={["Week of", "Status", "Attempts", "Detail"]}
              empty="No check-ins yet."
              rows={checkins.map((c) => [
                formatDay(c.week_start, true),
                <Badge key="s" variant="outline" className={`font-normal ${CHECKIN_STATUS[c.status].className}`}>
                  {CHECKIN_STATUS[c.status].label}
                </Badge>,
                formatNumber(c.attempts),
                <span key="d" className="whitespace-normal text-xs text-muted-foreground">
                  {c.status === "skipped"
                    ? (c.skip_reasons ?? []).map((r) => formatSkipReason(r.kind)).join("; ")
                    : c.status === "ready"
                      ? `${c.model ?? ""}${c.dismissed_at ? " · dismissed" : ""}`
                      : c.next_retry_at
                        ? `Retry after ${formatDateTime(c.next_retry_at)}`
                        : ""}
                </span>,
              ])}
            />
          </Panel>

          <Panel title="AI calls" description="Latest 20 model calls for this user (metadata only)">
            <SimpleTable
              columns={["When", "Feature", "Status", "Tokens in/out", "Latency"]}
              empty="No model calls for this user."
              rows={ai_requests.map((r) => [
                formatDateTime(r.created_at),
                r.feature,
                formatAiStatus(r.status),
                r.prompt_tokens != null ? `${formatNumber(r.prompt_tokens)} / ${formatNumber(r.completion_tokens)}` : "—",
                formatMs(r.latency_ms),
              ])}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}
