"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProgramBuilder } from "@/features/programs/context/program-builder.context";
import { AddExerciseDialog } from "./add-exercise-dialog";
import type { ProgramBuilderSession, ProgramBuilderExercise } from "@/features/programs/types";

interface Props {
  dayIndex: number;
  session: ProgramBuilderSession;
  canDelete: boolean;
}

export function SessionCard({ dayIndex, session, canDelete }: Props) {
  const { dispatch } = useProgramBuilder();
  const [addExOpen, setAddExOpen] = useState(false);
  const [editExercise, setEditExercise] = useState<ProgramBuilderExercise | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(session.name);

  function commitName() {
    const trimmed = nameInput.trim();
    if (trimmed) {
      dispatch({ type: "SET_SESSION_NAME", dayIndex, sessionTempId: session.tempId, value: trimmed });
    } else {
      setNameInput(session.name);
    }
    setEditingName(false);
  }

  function handleAddExercise(exercise: ProgramBuilderExercise) {
    if (editExercise) {
      dispatch({ type: "UPDATE_EXERCISE", dayIndex, sessionTempId: session.tempId, exercise });
      setEditExercise(null);
    } else {
      dispatch({ type: "ADD_EXERCISE", dayIndex, sessionTempId: session.tempId, exercise });
    }
  }

  function openEditExercise(ex: ProgramBuilderExercise) {
    setEditExercise(ex);
    setAddExOpen(true);
  }

  return (
    <div className="rounded-lg border border-border bg-white">
      {/* Session header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
        {editingName ? (
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") { setNameInput(session.name); setEditingName(false); } }}
            className="h-6 w-36 text-xs"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-indigo-600 transition-colors"
          >
            {session.name}
            <Pencil className="size-3 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100" />
          </button>
        )}
        <Badge variant="secondary" className="ml-1 text-xs">
          {session.exercises.length} exercise{session.exercises.length !== 1 ? "s" : ""}
        </Badge>
        <div className="ml-auto flex items-center gap-1">
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => dispatch({ type: "REMOVE_SESSION", dayIndex, sessionTempId: session.tempId })}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Exercises */}
      <div className="flex flex-col divide-y divide-border">
        {session.exercises.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No exercises yet. Add one below.
          </div>
        ) : (
          session.exercises.map((ex, idx) => (
            <div key={ex.tempId} className="flex items-start gap-3 px-3 py-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {idx + 1}
              </span>
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="truncate text-sm font-medium text-foreground">{ex.exercise_name}</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{ex.target_sets}×{ex.min_reps}–{ex.max_reps}</span>
                  {ex.target_rir != null && (
                    <span>RIR {ex.target_rir}</span>
                  )}
                  {ex.rest_seconds != null && (
                    <span>{ex.rest_seconds}s rest</span>
                  )}
                  {ex.tempo && <span>Tempo {ex.tempo}</span>}
                  {ex.notes && (
                    <span className="italic line-clamp-1 max-w-xs">&ldquo;{ex.notes}&rdquo;</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => openEditExercise(ex)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => dispatch({ type: "REMOVE_EXERCISE", dayIndex, sessionTempId: session.tempId, exerciseTempId: ex.tempId })}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add exercise footer */}
      <div className="border-t border-border px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          disabled={session.exercises.length >= 50}
          onClick={() => { setEditExercise(null); setAddExOpen(true); }}
        >
          <Plus className="size-4" />
          Add exercise
          {session.exercises.length >= 50 && <span className="text-xs">(max 50)</span>}
        </Button>
      </div>

      <AddExerciseDialog
        open={addExOpen}
        onOpenChange={(v) => { setAddExOpen(v); if (!v) setEditExercise(null); }}
        editExercise={editExercise}
        onConfirm={handleAddExercise}
      />
    </div>
  );
}
