export type ProgressionRuleType =
  | "double_progression"
  | "static_load"
  | "rir_based"
  | "rir_cycling"
  | "percentage_based";

export interface ProgressionRule {
  id: string;
  name: string;
  type: ProgressionRuleType;
  config: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export const PROGRESSION_RULE_TYPE_LABELS: Record<ProgressionRuleType, string> = {
  double_progression: "Double Progression",
  static_load: "Static Load",
  rir_based: "RIR Based",
  rir_cycling: "RIR Cycling",
  percentage_based: "Percentage Based",
};
