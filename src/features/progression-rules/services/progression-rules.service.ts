import { apiClient } from "@/lib/api-client";
import type { PaginatedData } from "@/types/api";
import type { ProgressionRule, ProgressionRuleType } from "@/features/progression-rules/types";

export interface ListProgressionRulesParams {
  page?: number;
  limit?: number;
}

export async function listProgressionRules(
  params: ListProgressionRulesParams = {},
): Promise<PaginatedData<ProgressionRule>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiClient.get<PaginatedData<ProgressionRule>>(
    `/admin/crud/progression-rules/list${qs ? `?${qs}` : ""}`,
  );
}

export interface CreateProgressionRulePayload {
  name: string;
  type: ProgressionRuleType;
  config: Record<string, unknown>;
}

export async function createProgressionRule(
  payload: CreateProgressionRulePayload,
): Promise<ProgressionRule> {
  return apiClient.post<ProgressionRule>("/admin/crud/progression-rules/create", payload);
}

export interface UpdateProgressionRulePayload {
  id: string;
  name?: string;
  type?: ProgressionRuleType;
  config?: Record<string, unknown>;
}

export async function updateProgressionRule(
  payload: UpdateProgressionRulePayload,
): Promise<ProgressionRule> {
  const { id, ...body } = payload;
  return apiClient.put<ProgressionRule>(`/admin/crud/progression-rules/update/${id}`, body);
}

export async function deleteProgressionRule(id: string): Promise<ProgressionRule> {
  return apiClient.delete<ProgressionRule>(`/admin/crud/progression-rules/delete/${id}`);
}
