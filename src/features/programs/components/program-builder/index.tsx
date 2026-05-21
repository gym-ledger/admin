"use client";

import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramBuilderProvider, useProgramBuilder } from "@/features/programs/context/program-builder.context";
import { ProgramConfigSection } from "./program-config-section";
import { DayTabs } from "./day-tabs";
import { useCreateProgram, useUpdateProgram } from "@/features/programs/components/hooks/use-programs";
import type { ProgramBuilderState } from "@/features/programs/types";
import { toast } from "sonner";

interface BuilderInnerProps {
  programId?: string;
}

function BuilderInner({ programId }: BuilderInnerProps) {
  const router = useRouter();
  const { state, dispatch } = useProgramBuilder();
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();

  const isEditing = !!programId;
  const isPending = createMutation.isPending || updateMutation.isPending;

  async function handleSave() {
    if (!state.name.trim()) {
      toast.error("Program name is required");
      return;
    }

    const payload = {
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

    if (isEditing) {
      await updateMutation.mutateAsync({ id: programId, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
      dispatch({ type: "RESET" });
    }
    router.push("/programs");
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
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => { dispatch({ type: "RESET" }); router.push("/programs"); }}
          >
            <X className="size-4" /> Discard
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            <Save className="size-4" /> {isEditing ? "Save changes" : "Save program"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 px-6 py-5">
        <ProgramConfigSection />
        <DayTabs />
      </div>
    </div>
  );
}

interface ProgramBuilderProps {
  programId?: string;
  initialValues?: ProgramBuilderState;
}

export function ProgramBuilder({ programId, initialValues }: ProgramBuilderProps = {}) {
  return (
    <ProgramBuilderProvider initialValues={initialValues}>
      <BuilderInner programId={programId} />
    </ProgramBuilderProvider>
  );
}
