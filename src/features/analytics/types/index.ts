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

export interface DashboardPulse {
  workouts: number;
  sets: number;
  /** Completed a workout or logged a weigh-in. */
  active_users: number;
  new_users: number;
  weigh_ins: number;
}

export interface Dashboard {
  generated_at: string;
  /** Last 7 days against the 7 before. */
  pulse: { current: DashboardPulse; previous: DashboardPulse };
  workouts_per_day: { date: string; workouts: number; users: number }[];
  top_programs: { id: string; name: string; active_users: number }[];
  top_exercises: { id: string; name: string; sets: number; users: number }[];
  content: {
    exercises: number;
    exercises_without_image: number;
    exercises_without_muscles: number;
    muscles: number;
    programs: number;
    programs_without_version: number;
  };
  attention: {
    ai_calls_24h: number;
    ai_failures_24h: number;
    checkins_failed_7d: number;
    ai_configured: boolean;
    ai_daily_limit: number;
    /** Null if the API couldn't read the counter. */
    ai_budget_used_today: number | null;
  };
  recent_signups: {
    id: string;
    name: string | null;
    /** Masked. */
    email: string | null;
    /** Masked. */
    phone: string | null;
    created_at: string;
    onboarded: boolean;
  }[];
}
