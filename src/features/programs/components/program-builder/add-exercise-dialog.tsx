"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronsUpDown, CheckIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useExercises } from "@/features/exercises/hooks/use-exercises";
import type { ProgramBuilderExercise } from "@/features/programs/types";
import { cn } from "@/lib/utils";

function coerceInt(v: string, fallback: number) {
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}
function coerceFloat(v: string) {
  if (!v.trim()) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

const schema = z.object({
  exercise_id: z.string().min(1, "Select an exercise"),
  target_sets: z.string().min(1),
  min_reps: z.string().min(1),
  max_reps: z.string().min(1),
  target_rir: z.string().optional(),
  rest_seconds: z.string().optional(),
  tempo: z.string().max(10).optional(),
  notes: z.string().max(500).optional(),
  visibility: z.enum(["public", "private"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editExercise?: ProgramBuilderExercise | null;
  onConfirm: (exercise: ProgramBuilderExercise) => void;
}

export function AddExerciseDialog({ open, onOpenChange, editExercise, onConfirm }: Props) {
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState(editExercise?.exercise_name ?? "");

  const { data: exercisesData } = useExercises({ limit: 100 });
  const exercises = exercisesData?.data ?? [];

  const defaultValues: FormValues = editExercise
    ? {
        exercise_id: editExercise.exercise_id,
        target_sets: String(editExercise.target_sets),
        min_reps: String(editExercise.min_reps),
        max_reps: String(editExercise.max_reps),
        target_rir: editExercise.target_rir !== null ? String(editExercise.target_rir) : "",
        rest_seconds: editExercise.rest_seconds !== null ? String(editExercise.rest_seconds) : "",
        tempo: editExercise.tempo ?? "",
        notes: editExercise.notes ?? "",
        visibility: editExercise.visibility,
      }
    : { exercise_id: "", target_sets: "3", min_reps: "8", max_reps: "12", target_rir: "", rest_seconds: "90", tempo: "", notes: "", visibility: "public" };

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedId = watch("exercise_id");

  function onSubmit(data: FormValues) {
    const minR = coerceInt(data.min_reps, 1);
    const maxR = coerceInt(data.max_reps, 1);
    if (minR > maxR) return; // silent guard
    onConfirm({
      tempId: editExercise?.tempId ?? crypto.randomUUID(),
      exercise_id: data.exercise_id,
      exercise_name: selectedExerciseName,
      exercise_order: editExercise?.exercise_order ?? 0,
      target_sets: coerceInt(data.target_sets, 3),
      min_reps: minR,
      max_reps: maxR,
      target_rir: coerceFloat(data.target_rir ?? ""),
      rest_seconds: coerceFloat(data.rest_seconds ?? "") != null ? parseInt(data.rest_seconds ?? "", 10) || null : null,
      tempo: data.tempo ?? "",
      notes: data.notes ?? "",
      visibility: data.visibility,
    });
    reset(defaultValues);
    setSelectedExerciseName(editExercise?.exercise_name ?? "");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { reset(defaultValues); setSelectedExerciseName(editExercise?.exercise_name ?? ""); } }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editExercise ? "Edit exercise" : "Add exercise"}</DialogTitle>
          <DialogDescription>Configure exercise parameters for this session.</DialogDescription>
        </DialogHeader>

        <form id="add-ex-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {/* Exercise picker */}
          <div className="flex flex-col gap-1.5">
            <Label>Exercise <span className="text-destructive">*</span></Label>
            <Popover open={exercisePickerOpen} onOpenChange={setExercisePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between font-normal"
                  aria-invalid={!!errors.exercise_id}
                >
                  {selectedExerciseName || <span className="text-muted-foreground">Select exercise…</span>}
                  <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search exercises…" />
                  <CommandList>
                    {exercises.length === 0 ? (
                      <CommandEmpty>No exercises found. Add exercises first.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {exercises.map((ex) => (
                          <CommandItem
                            key={ex.id}
                            value={ex.name}
                            onSelect={() => {
                              setValue("exercise_id", ex.id, { shouldValidate: true });
                              setSelectedExerciseName(ex.name);
                              setExercisePickerOpen(false);
                            }}
                            data-checked={selectedId === ex.id}
                          >
                            <CheckIcon className={cn("size-4 shrink-0", selectedId === ex.id ? "opacity-100" : "opacity-0")} />
                            {ex.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.exercise_id && <p className="text-xs text-destructive">{errors.exercise_id.message}</p>}
          </div>

          {/* Sets × Reps */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-sets">Sets</Label>
              <Input id="ex-sets" type="number" min={1} max={20} aria-invalid={!!errors.target_sets} {...register("target_sets")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-min-reps">Min Reps</Label>
              <Input id="ex-min-reps" type="number" min={1} aria-invalid={!!errors.min_reps} {...register("min_reps")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-max-reps">Max Reps</Label>
              <Input id="ex-max-reps" type="number" min={1} aria-invalid={!!errors.max_reps} {...register("max_reps")} />
            </div>
          </div>

          {/* RIR / Rest / Tempo */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-rir">Target RIR</Label>
              <Input id="ex-rir" type="number" min={0} max={10} step={0.5} placeholder="—" {...register("target_rir")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-rest">Rest (sec)</Label>
              <Input id="ex-rest" type="number" min={0} max={600} placeholder="—" {...register("rest_seconds")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-tempo">Tempo</Label>
              <Input id="ex-tempo" placeholder="3-1-2" maxLength={10} {...register("tempo")} />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ex-notes">Notes</Label>
            <Textarea id="ex-notes" placeholder="Optional coaching notes…" rows={2} className="resize-none" {...register("notes")} />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="add-ex-form">{editExercise ? "Save changes" : "Add exercise"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
