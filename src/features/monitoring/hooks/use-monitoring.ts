import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getIssue,
  getIssueSummary,
  getMonitoringStatus,
  getPerformance,
  getRouteStats,
  listIssues,
} from "@/features/monitoring/services/monitoring.service";
import type { IssueFilters, MetricsWindow } from "@/features/monitoring/types";

export const monitoringKeys = {
  status: ["monitoring", "status"] as const,
  performance: (window: MetricsWindow) => ["monitoring", "performance", window] as const,
  routes: (window: MetricsWindow) => ["monitoring", "routes", window] as const,
  issueSummary: (filters: IssueFilters) => ["monitoring", "issues", "summary", filters] as const,
  issues: (filters: IssueFilters, page: number) => ["monitoring", "issues", "list", filters, page] as const,
  issue: (id: string) => ["monitoring", "issues", "view", id] as const,
};

// Live numbers: refreshed every minute while the page is open.
const LIVE_REFRESH_MS = 60_000;

export function useMonitoringStatus() {
  return useQuery({
    queryKey: monitoringKeys.status,
    queryFn: getMonitoringStatus,
  });
}

export function usePerformance(window: MetricsWindow, enabled: boolean) {
  return useQuery({
    queryKey: monitoringKeys.performance(window),
    queryFn: () => getPerformance(window),
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFRESH_MS,
    enabled,
  });
}

export function useRouteStats(window: MetricsWindow, enabled: boolean) {
  return useQuery({
    queryKey: monitoringKeys.routes(window),
    queryFn: () => getRouteStats(window),
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFRESH_MS,
    enabled,
  });
}

export function useIssueSummary(filters: IssueFilters) {
  return useQuery({
    queryKey: monitoringKeys.issueSummary(filters),
    queryFn: () => getIssueSummary(filters),
    placeholderData: keepPreviousData,
  });
}

export function useIssues(filters: IssueFilters, page: number, limit = 25) {
  return useQuery({
    queryKey: monitoringKeys.issues(filters, page),
    queryFn: () => listIssues(filters, page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useIssue(id: string | null) {
  return useQuery({
    queryKey: monitoringKeys.issue(id ?? ""),
    queryFn: () => getIssue(id!),
    enabled: Boolean(id),
  });
}
