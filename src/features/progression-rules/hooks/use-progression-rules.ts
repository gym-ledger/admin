import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listProgressionRules,
  createProgressionRule,
  updateProgressionRule,
  deleteProgressionRule,
  type ListProgressionRulesParams,
  type CreateProgressionRulePayload,
  type UpdateProgressionRulePayload,
} from "@/features/progression-rules/services/progression-rules.service";
import { getErrorMessage } from "@/types/api";

export const progressionRuleKeys = {
  all: ["progression-rules"] as const,
  list: (params: ListProgressionRulesParams) =>
    ["progression-rules", "list", params] as const,
};

export function useProgressionRules(params: ListProgressionRulesParams = {}) {
  return useQuery({
    queryKey: progressionRuleKeys.list(params),
    queryFn: () => listProgressionRules(params),
  });
}

export function useCreateProgressionRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgressionRulePayload) =>
      createProgressionRule(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: progressionRuleKeys.all });
      toast.success("Progression rule created");
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(err),
      );
    },
  });
}

export function useUpdateProgressionRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProgressionRulePayload) =>
      updateProgressionRule(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: progressionRuleKeys.all });
      toast.success("Progression rule updated");
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(err),
      );
    },
  });
}

export function useDeleteProgressionRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProgressionRule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: progressionRuleKeys.all });
      toast.success("Progression rule deleted");
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(err),
      );
    },
  });
}
