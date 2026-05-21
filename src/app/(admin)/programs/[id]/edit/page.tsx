"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramBuilder } from "@/features/programs/components/program-builder/index";
import { useProgram } from "@/features/programs/components/hooks/use-programs";
import type { ProgramWithDetails, ProgramBuilderState, ProgramBuilderDay } from "@/features/programs/types";

function mapProgramToBuilderState(program: ProgramWithDetails): ProgramBuilderState {
  const daysByNumber = new Map(program.program_days.map((d) => [d.dayNumber, d]));

  const days: ProgramBuilderDay[] = Array.from({ length: 7 }, (_, i) => {
    const day = daysByNumber.get(i + 1);
    if (day) {
      return {
        dayNumber: day.dayNumber,
        name: day.name ?? "",
        visibility: day.visibility,
        sessions: day.sessions.map((session) => ({
          tempId: session.id ?? crypto.randomUUID(),
          name: session.name,
          visibility: session.visibility,
          exercises: session.exercises.map((ex) => ({
            tempId: ex.id ?? crypto.randomUUID(),
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise_name,
            exercise_order: ex.exercise_order,
            target_sets: ex.target_sets,
            min_reps: ex.min_reps,
            max_reps: ex.max_reps,
            target_rir: ex.target_rir,
            rest_seconds: ex.rest_seconds,
            tempo: ex.tempo ?? "",
            notes: ex.notes ?? "",
            visibility: ex.visibility,
          })),
        })),
      };
    }
    return {
      dayNumber: i + 1,
      name: "",
      sessions: [{ tempId: crypto.randomUUID(), name: "Morning", exercises: [], visibility: "public" as const }],
      visibility: "public" as const,
    };
  });

  return {
    name: program.name,
    visibility: program.visibility,
    description: program.description ?? "",
    split_type: program.split_type,
    session_ordering_logic: program.session_ordering_logic,
    duration_type: program.duration_type,
    duration_weeks: program.duration_weeks,
    version_visibility: program.version_visibility,
    days,
  };
}

function EditProgramContent({ id }: { id: string }) {
  const { data: program, isLoading, isError } = useProgram(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-0">
        <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-border bg-zinc-50 px-6">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-col gap-5 px-6 py-5">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Program not found.
      </div>
    );
  }

  const initialValues = mapProgramToBuilderState(program);

  return <ProgramBuilder programId={id} initialValues={initialValues} />;
}

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditProgramContent id={id} />;
}
