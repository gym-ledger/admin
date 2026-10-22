/** Activity figures, as the API defines them (adminAnalytics.repository.ts there). */
export interface UserActivity {
  created_at: string;
  last_active_at: string | null;
  workouts_7d: number;
  workouts_30d: number;
  weigh_in_days_30d: number;
  has_active_plan: boolean;
  has_goal: boolean;
  ai_calls: number;
}

/** A users-list row. Email and phone arrive already masked by the API. */
export interface UserListItem extends UserActivity {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export type UserSort = "last_active" | "created_at";
export type UserActivityFilter = "active_7d" | "inactive_30d";

export interface UserDetail {
  user: {
    id: string;
    name: string | null;
    /** Full email and phone: the detail view isn't masked. */
    email: string | null;
    phone: string | null;
    timezone: string | null;
    weight_units: "kg" | "lbs" | null;
  };
  activity: UserActivity;
  goal: {
    weight_goal: "lose" | "maintain" | "gain";
    preset: string | null;
    target_weight: number | null;
    goal_date: string | null;
    set_on: string | null;
  } | null;
  plans: {
    id: string;
    program_name: string;
    version_number: number;
    is_active: boolean;
    started_at: string | null;
    created_at: string;
  }[];
  recent_workouts: {
    id: string;
    program_name: string | null;
    started_at: string;
    completed_at: string | null;
    working_sets: number;
  }[];
  weight_trend: { date: string; weight: number }[];
  checkins: {
    id: string;
    week_start: string;
    status: "pending" | "ready" | "failed" | "skipped";
    skip_reasons: { kind: string }[] | null;
    attempts: number;
    model: string | null;
    generated_at: string | null;
    dismissed_at: string | null;
    next_retry_at: string | null;
  }[];
  ai_requests: {
    id: string;
    feature: string;
    model: string;
    status: string;
    prompt_tokens: number | null;
    completion_tokens: number | null;
    latency_ms: number | null;
    created_at: string;
  }[];
}

export interface CheckinRetryResult {
  id: string;
  status: "pending" | "ready" | "failed" | "skipped";
  attempts: number;
  next_retry_at: string | null;
}
