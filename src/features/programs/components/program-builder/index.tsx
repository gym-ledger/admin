"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, X, Pencil, GitBranchPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramBuilderProvider, useProgramBuilder } from "@/features/programs/context/program-builder.context";
import { ProgramConfigSection } from "./program-config-section";
import { DayTabs } from "./day-tabs";
import { useCreateProgram, useUpdateProgram } from "@/features/programs/components/hooks/use-programs";
import type { CreateWorkoutProgramPayload } from "@/features/programs/components/services/programs.service";
import type { ProgramBuilderState } from "@/features/programs/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BuilderInnerProps {
  programId?: string;
  readOnly?: boolean;
  saveLabel?: string;
  onSave?: (payload: CreateWorkoutProgramPayload) => Promise<unknown>;
  onSaveAsNewVersion?: (payload: CreateWorkoutProgramPayload) => Promise<unknown>;
  onRequestEdit?: () => void;
  headerExtra?: React.ReactNode;
}

function BuilderInner({
  programId,
  readOnly,
  saveLabel,
  onSave,
  onSaveAsNewVersion,
  onRequestEdit,
  headerExtra,
}: BuilderInnerProps) {
  const router = useRouter();
  const { state, dispatch } = useProgramBuilder();
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const [isSavingNewVersion, setIsSavingNewVersion] = useState(false);

  const isEditing = !!programId;
  const isPending = createMutation.isPending || updateMutation.isPending || isSavingNewVersion;

  function buildPayload(): CreateWorkoutProgramPayload | null {
    if (!state.name.trim()) {
      toast.error("Program name is required");
      return null;
    }
    return {
      name: state.name,
      description: state.description,
      visibility: state.visibility,
      split_type: state.split_type,
      session_ordering_logic: state.session_ordering_logic,
      duration_type: state.duration_type,
      duration_weeks: state.duration_weeks,
      version_visibility: state.version_visibility,
      program_days: state.days,
    };
  }

  async function handleSave() {
    const payload = buildPayload();
    if (!payload) return;

    if (onSave) {
      await onSave(payload);
    } else if (isEditing) {
      await updateMutation.mutateAsync({ id: programId!, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
      dispatch({ type: "RESET" });
    }
    router.push("/programs");
  }

  async function handleSaveAsNewVersion() {
    if (!onSaveAsNewVersion) return;
    const payload = buildPayload();
    if (!payload) return;

    setIsSavingNewVersion(true);
    try {
      await onSaveAsNewVersion(payload);
      router.push("/programs");
    } finally {
      setIsSavingNewVersion(false);
    }
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-zinc-50 px-6">
        <div>
          <h1 className="text-sm font-semibold text-foreground">
            {isEditing ? "Edit Workout Program" : "New Workout Program"}
          </h1>
          <p className="text-xs text-muted-foreground">
            7 days / week
            {state.name && <> · <span className="text-foreground">{state.name}</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          {readOnly ? (
            onRequestEdit && (
              <Button size="sm" onClick={onRequestEdit}>
                <Pencil className="size-4" /> Edit this version
              </Button>
            )
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => { dispatch({ type: "RESET" }); router.push("/programs"); }}
              >
                <X className="size-4" /> Discard
              </Button>
              {onSaveAsNewVersion && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleSaveAsNewVersion}
                >
                  <GitBranchPlus className="size-4" /> Save as new version
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                <Save className="size-4" /> {saveLabel ?? (isEditing ? "Save changes" : "Save program")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-5 px-6 py-5",
          readOnly && "pointer-events-none select-none opacity-60",
        )}
        aria-disabled={readOnly}
      >
        <ProgramConfigSection />
        <DayTabs />
      </div>
    </div>
  );
}

interface ProgramBuilderProps {
  programId?: string;
  initialValues?: ProgramBuilderState;
  readOnly?: boolean;
  saveLabel?: string;
  onSave?: (payload: CreateWorkoutProgramPayload) => Promise<unknown>;
  onSaveAsNewVersion?: (payload: CreateWorkoutProgramPayload) => Promise<unknown>;
  onRequestEdit?: () => void;
  headerExtra?: React.ReactNode;
}

export function ProgramBuilder({
  programId,
  initialValues,
  readOnly,
  saveLabel,
  onSave,
  onSaveAsNewVersion,
  onRequestEdit,
  headerExtra,
}: ProgramBuilderProps = {}) {
  return (
    <ProgramBuilderProvider initialValues={initialValues}>
      <BuilderInner
        programId={programId}
        readOnly={readOnly}
        saveLabel={saveLabel}
        onSave={onSave}
        onSaveAsNewVersion={onSaveAsNewVersion}
        onRequestEdit={onRequestEdit}
        headerExtra={headerExtra}
      />
    </ProgramBuilderProvider>
  );
}
