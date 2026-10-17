import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAiDaily,
  getAiSummary,
  getCheckinOutcomes,
  getOverview,
} from "@/features/analytics/services/analytics.service";
import type { DateRange } from "@/features/analytics/types";

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (range: DateRange) => ["analytics", "overview", range] as const,
  aiSummary: (range: DateRange) => ["analytics", "ai", "summary", range] as const,
  aiDaily: (range: DateRange) => ["analytics", "ai", "daily", range] as const,
  checkins: (range: DateRange) => ["analytics", "ai", "checkins", range] as const,
};

// Previous data stays on screen while a new range loads, so charts don't jump.
export function useOverview(range: DateRange) {
  return useQuery({
    queryKey: analyticsKeys.overview(range),
    queryFn: () => getOverview(range),
    placeholderData: keepPreviousData,
  });
}

export function useAiSummary(range: DateRange) {
  return useQuery({
    queryKey: analyticsKeys.aiSummary(range),
    queryFn: () => getAiSummary(range),
    placeholderData: keepPreviousData,
  });
}

export function useAiDaily(range: DateRange) {
  return useQuery({
    queryKey: analyticsKeys.aiDaily(range),
    queryFn: () => getAiDaily(range),
    placeholderData: keepPreviousData,
  });
}

export function useCheckinOutcomes(range: DateRange) {
  return useQuery({
    queryKey: analyticsKeys.checkins(range),
    queryFn: () => getCheckinOutcomes(range),
    placeholderData: keepPreviousData,
  });
}
