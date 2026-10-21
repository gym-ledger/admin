import { apiClient } from "@/lib/api-client";
import type {
  AiDaily,
  AiSummary,
  CheckinOutcomes,
  Dashboard,
  DateRange,
  Overview,
} from "@/features/analytics/types";

function rangeQuery(range: DateRange) {
  return new URLSearchParams({ from: range.from, to: range.to }).toString();
}

export async function getOverview(range: DateRange): Promise<Overview> {
  return apiClient.get<Overview>(`/admin/analytics/overview?${rangeQuery(range)}`);
}

export async function getAiSummary(range: DateRange): Promise<AiSummary> {
  return apiClient.get<AiSummary>(`/admin/analytics/ai/summary?${rangeQuery(range)}`);
}

export async function getAiDaily(range: DateRange): Promise<AiDaily> {
  return apiClient.get<AiDaily>(`/admin/analytics/ai/daily?${rangeQuery(range)}`);
}

export async function getCheckinOutcomes(range: DateRange): Promise<CheckinOutcomes> {
  return apiClient.get<CheckinOutcomes>(`/admin/analytics/ai/checkins?${rangeQuery(range)}`);
}

export async function getDashboard(): Promise<Dashboard> {
  return apiClient.get<Dashboard>("/admin/analytics/dashboard");
}
