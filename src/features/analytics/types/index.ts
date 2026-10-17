export interface DateRange {
  from: string;
  to: string;
}

export type AiRequestStatus =
  | "success"
  | "rate_limited"
  | "timeout"
  | "provider_error"
  | "bad_output"
  | "daily_limit"
  | "not_configured";

export interface AiBreakdownItem {
  key: string;
  count: number;
  tokens: number;
}

export interface AiSummary {
  range: DateRange;
  config: {
    configured: boolean;
    model: string;
    daily_limit: number;
  };
  today: {
    date: string;
    calls: number;
    budget_used: number;
    /** Redis counter the limit is enforced with; null if Redis was unreachable. */
    budget_counter: number | null;
    by_status: { status: AiRequestStatus; count: number }[];
  };
  totals: {
    calls: number;
    success: number;
    success_rate: number | null;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    latency_p50_ms: number | null;
    latency_p95_ms: number | null;
  };
  by_status: AiBreakdownItem[];
  by_feature: AiBreakdownItem[];
  by_model: AiBreakdownItem[];
}

export interface AiDaily {
  range: DateRange;
  feature: string | null;
  days: {
    date: string;
    total: number;
    success: number;
    failed: number;
    tokens: number;
  }[];
}

export interface CheckinOutcomes {
  range: DateRange;
  totals: { weeks: number; users: number; attempts: number };
  weeks: {
    week_start: string;
    ready: number;
    failed: number;
    skipped: number;
    pending: number;
  }[];
  skip_reasons: { kind: string; count: number; long_inactive: number }[];
}

export interface Overview {
  range: DateRange;
  users: {
    total_users: number;
    new_users_in_range: number;
    users_with_active_plan: number;
    users_with_goal: number;
  };
  active: { dau: number; wau: number; mau: number };
  new_users_per_week: { week_start: string; count: number }[];
}
