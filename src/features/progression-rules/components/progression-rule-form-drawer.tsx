"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { progressionRuleSchema, type ProgressionRuleInput } from "@/features/progression-rules/schemas/progression-rule.schema";
import { PROGRESSION_RULE_TYPE_LABELS, type ProgressionRule } from "@/features/progression-rules/types";

const DEFAULT_CONFIGS: Record<string, string> = {
  double_progression: JSON.stringify({ min_reps: 8, max_reps: 12, load_increment: 2.5 }, null, 2),
  static_load: JSON.stringify({ target_reps: 10, target_sets: 3 }, null, 2),
  rir_based: JSON.stringify({ target_rir: 2, adjustment_threshold: 1 }, null, 2),
  rir_cycling: JSON.stringify({ week_1_rir: 3, week_2_rir: 2, week_3_rir: 1, deload_rir: 4 }, null, 2),
  percentage_based: JSON.stringify({ increment_percent: 5, apply_every_n_sessions: 1 }, null, 2),
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule: ProgressionRule | null;
  onSave: (data: Omit<ProgressionRule, "id" | "deleted_at" | "created_at" | "updated_at">) => void;
}

export function ProgressionRuleFormDrawer({ open, onOpenChange, rule, onSave }: Props) {
  const isEdit = !!rule;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProgressionRuleInput>({
    resolver: zodResolver(progressionRuleSchema),
    defaultValues: { type: "double_progression", config: DEFAULT_CONFIGS.double_progression },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (open) {
      if (rule) {
        reset({ name: rule.name, type: rule.type, config: JSON.stringify(rule.config, null, 2) });
      } else {
        reset({ name: "", type: "double_progression", config: DEFAULT_CONFIGS.double_progression });
      }
    }
  }, [open, rule, reset]);

  function onTypeChange(t: ProgressionRuleInput["type"]) {
    setValue("type", t, { shouldValidate: true });
    if (!isEdit) {
      setValue("config", DEFAULT_CONFIGS[t] ?? "{}", { shouldValidate: false });
    }
  }

  function onSubmit(data: ProgressionRuleInput) {
    onSave({ name: data.name, type: data.type, config: JSON.parse(data.config) });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg" showCloseButton={false}>
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? "Edit rule" : "New progression rule"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update the rule configuration." : "Define how load progresses over time."}
          </SheetDescription>
        </SheetHeader>

        <form id="pr-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pr-name">Name <span className="text-destructive">*</span></Label>
            <Input id="pr-name" placeholder="e.g. Linear Double Progression" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pr-type">Type <span className="text-destructive">*</span></Label>
            <Select value={selectedType} onValueChange={(v) => onTypeChange(v as ProgressionRuleInput["type"])}>
              <SelectTrigger id="pr-type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PROGRESSION_RULE_TYPE_LABELS) as Array<keyof typeof PROGRESSION_RULE_TYPE_LABELS>).map((t) => (
                  <SelectItem key={t} value={t}>{PROGRESSION_RULE_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="pr-config">Config (JSON) <span className="text-destructive">*</span></Label>
              <span className="text-xs text-muted-foreground">Must be valid JSON</span>
            </div>
            <Textarea
              id="pr-config"
              rows={10}
              className="resize-none font-mono text-xs"
              aria-invalid={!!errors.config}
              {...register("config")}
            />
            {errors.config && <p className="text-xs text-destructive">{errors.config.message}</p>}
          </div>
        </form>

        <SheetFooter className="border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="pr-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create rule"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
