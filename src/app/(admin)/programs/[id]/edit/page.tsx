"use client";

import { use, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgramBuilder } from "@/features/programs/components/program-builder/index";
import {
  useProgram,
  useProgramVersions,
  useCreateProgramVersion,
} from "@/features/programs/components/hooks/use-programs";
import type { CreateWorkoutProgramPayload } from "@/features/programs/components/services/programs.service";
import type { ProgramWithDetails, ProgramBuilderState, ProgramBuilderDay } from "@/features/programs/types";

function mapProgramToBuilderState(program: ProgramWithDetails): ProgramBuilderState {
  const daysByNumber = new Map(program.program_days?.map((d) => [d.day_number, d]) ?? []);

  const days: ProgramBuilderDay[] = Array.from({ length: 7 }, (_, i) => {
    const day = daysByNumber.get(i + 1);
    if (day) {
      return {
        day_number: day.day_number,
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
      day_number: i + 1,
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
  const { data: versions } = useProgramVersions(id);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [editingOldVersion, setEditingOldVersion] = useState(false);

  const latestVersion = versions?.[0];
  const isViewingLatest = !selectedVersionId || selectedVersionId === latestVersion?.id;

  const { data: program, isLoading, isError } = useProgram(id, selectedVersionId ?? undefined);
  const createVersionMutation = useCreateProgramVersion();

  if (isLoading || !versions) {
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
  const readOnly = !isViewingLatest && !editingOldVersion;
  const activeVersionId = selectedVersionId ?? latestVersion?.id ?? "latest";
  const usageCount = versions.find((v) => v.id === activeVersionId)?.usage_count ?? 0;

  async function handleSaveAsNewVersion(payload: CreateWorkoutProgramPayload) {
    await createVersionMutation.mutateAsync({ id, ...payload });
  }

  return (
    <ProgramBuilder
      key={activeVersionId}
      programId={id}
      initialValues={initialValues}
      readOnly={readOnly}
      saveLabel={!isViewingLatest ? "Save as new version" : undefined}
      onSave={!isViewingLatest ? handleSaveAsNewVersion : undefined}
      onSaveAsNewVersion={isViewingLatest ? handleSaveAsNewVersion : undefined}
      onRequestEdit={() => setEditingOldVersion(true)}
      headerExtra={
        <div className="flex items-center gap-2">
          {usageCount > 0 && (
            <Badge variant="secondary" className="font-normal">
              Used by {usageCount} user{usageCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {versions.length > 1 && (
            <Select
              value={activeVersionId}
              onValueChange={(v) => {
                setSelectedVersionId(v === latestVersion?.id ? null : v);
                setEditingOldVersion(false);
              }}
            >
              <SelectTrigger className="w-44" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    v{v.version_number}
                    {v.id === latestVersion?.id ? " (latest)" : ""}
                    {v.usage_count > 0 ? ` — used by ${v.usage_count}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      }
    />
  );
}

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditProgramContent id={id} />;
}
