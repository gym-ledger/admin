import { apiClient } from "@/lib/api-client";
import type {
  IssueFilters,
  IssueSummary,
  MetricsWindow,
  MonitoringStatus,
  PerformanceOverview,
  RequestIssueDetail,
  RequestIssuePage,
  RouteStats,
} from "@/features/monitoring/types";

function filterQuery(filters: IssueFilters, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ from: filters.from, to: filters.to, ...extra });
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.statusClass) params.set("statusClass", filters.statusClass);
  if (filters.errorType) params.set("errorType", filters.errorType);
  if (filters.route) params.set("route", filters.route);
  return params.toString();
}

export async function getMonitoringStatus(): Promise<MonitoringStatus> {
  return apiClient.get<MonitoringStatus>("/admin/monitoring/status");
}

export async function getPerformance(window: MetricsWindow): Promise<PerformanceOverview> {
  return apiClient.get<PerformanceOverview>(`/admin/monitoring/performance?window=${window}`);
}

export async function getRouteStats(window: MetricsWindow): Promise<RouteStats> {
  return apiClient.get<RouteStats>(`/admin/monitoring/routes?window=${window}`);
}

export async function getIssueSummary(filters: IssueFilters): Promise<IssueSummary> {
  return apiClient.get<IssueSummary>(`/admin/monitoring/issues/summary?${filterQuery(filters)}`);
}

export async function listIssues(filters: IssueFilters, page: number, limit: number): Promise<RequestIssuePage> {
  return apiClient.get<RequestIssuePage>(
    `/admin/monitoring/issues/list?${filterQuery(filters, { page: String(page), limit: String(limit) })}`,
  );
}

export async function getIssue(id: string): Promise<RequestIssueDetail> {
  return apiClient.get<RequestIssueDetail>(`/admin/monitoring/issues/view/${id}`);
}
