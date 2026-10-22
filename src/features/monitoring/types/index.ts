import type { PaginatedData } from "@/types/api";

export type MetricsWindow = "1h" | "6h" | "24h" | "7d" | "30d";

export interface MonitoringStatus {
  prometheus: { configured: boolean; reachable: boolean };
  grafanaUrl: string | null;
  slowThresholdMs: number;
  retentionDays: number;
}

export interface PerformancePoint {
  /** ms since the epoch */
  t: number;
  p50_ms?: number | null;
  p95_ms?: number | null;
  p99_ms?: number | null;
  requests_per_min?: number | null;
  client_errors_per_min?: number | null;
  server_errors_per_min?: number | null;
}

export interface PerformanceOverview {
  window: MetricsWindow;
  summary: {
    requests: number;
    p50_ms: number | null;
    p95_ms: number | null;
    p99_ms: number | null;
    client_errors: number;
    server_errors: number;
    /** 0–100, or null with no traffic. 4xx excludes expired-token 401s. */
    client_error_rate_pct: number | null;
    server_error_rate_pct: number | null;
    expired_token_401s: number;
    aborted: number;
  };
  errorsByStatus: { status_code: number; error_type: string; count: number }[];
  process: {
    event_loop_lag_p99_ms: number | null;
    heap_used_mb: number | null;
    cpu_cores_used: number | null;
    db_pool_waiting: number | null;
    in_flight: number | null;
  };
  series: PerformancePoint[];
}

export interface RouteStat {
  method: string;
  route: string;
  requests: number;
  p50_ms: number | null;
  p95_ms: number | null;
  p99_ms: number | null;
  client_errors: number;
  server_errors: number;
  error_rate_pct: number | null;
}

export interface RouteStats {
  window: MetricsWindow;
  routes: RouteStat[];
}

export interface IssueFilters {
  from: string;
  to: string;
  kind?: "error" | "slow";
  statusClass?: "4xx" | "5xx";
  errorType?: string;
  route?: string;
}

export interface IssueSummary {
  from: string;
  to: string;
  totals: {
    errors: number;
    server_errors: number;
    client_errors: number;
    slow: number;
    users_affected: number;
  };
  byStatus: { status_code: number; count: number }[];
  byErrorType: { error_type: string | null; count: number }[];
  byRoute: { method: string; route: string; errors: number; slow: number; max_duration_ms: number }[];
  perDay: { day: string; client_errors: number; server_errors: number; slow: number }[];
  facets: { routes: string[]; errorTypes: string[] };
}

export interface RequestIssue {
  id: string;
  created_at: string;
  request_id: string | null;
  method: string;
  route: string;
  path: string;
  status_code: number;
  duration_ms: number;
  is_error: boolean;
  is_slow: boolean;
  error_type: string | null;
  error_message: string | null;
  user_id: string | null;
  admin_user_id: string | null;
}

export interface RequestIssueDetail extends RequestIssue {
  error_stack: string | null;
  user_name: string | null;
  admin_email: string | null;
}

export type RequestIssuePage = PaginatedData<RequestIssue>;
