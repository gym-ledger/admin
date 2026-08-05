"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ImageIcon, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exerciseFormSchema,
  type ExerciseFormInput,
} from "@/features/exercises/schemas/exercise.schema";
import {
  useCreateExercise,
  useUpdateExercise,
  useExercise,
} from "@/features/exercises/hooks/use-exercises";
import {
  ExerciseMusclesField,
  type ExerciseMuscleSelection,
} from "@/features/exercises/components/exercise-muscles-field";
import type { Exercise } from "@/features/exercises/types";

interface ExerciseFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: Exercise | null;
}

export function ExerciseFormDrawer({
  open,
  onOpenChange,
  exercise,
}: ExerciseFormDrawerProps) {
  const isEdit = !!exercise;
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: detail, isLoading: isLoadingDetail } = useExercise(
    open && exercise ? exercise.id : null,
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exerciseMuscles, setExerciseMuscles] = useState<ExerciseMuscleSelection[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExerciseFormInput>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: { visibility: "public" },
  });

  useEffect(() => {
    if (!open) return;
    if (exercise) {
      reset({
        name: exercise.name,
        description: exercise.description ?? "",
        visibility: exercise.visibility as "public" | "private",
      });
      setImagePreview(exercise.image_url ?? null);
    } else {
      reset({ name: "", description: "", visibility: "public" });
      setImagePreview(null);
      setExerciseMuscles([]);
    }
    setImageFile(null);
  }, [open, exercise, reset]);

  useEffect(() => {
    if (!open || !detail) return;
    setExerciseMuscles(
      detail.exerciseMuscles.map((em) => ({
        muscle_id: em.muscle.id,
        muscleName: em.muscle.name,
        contributionPercent: Math.round(em.contribution * 100),
      })),
    );
  }, [open, detail]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: ExerciseFormInput) {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      visibility: data.visibility,
      image: imageFile ?? undefined,
      exerciseMuscles: exerciseMuscles.map((m) => ({
        muscle_id: m.muscle_id,
        contribution: m.contributionPercent / 100,
      })),
    };

    if (isEdit && exercise) {
      await updateMutation.mutateAsync({ id: exercise.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const visibility = watch("visibility");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-lg"
        showCloseButton={false}
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>
            {isEdit ? "Edit exercise" : "New exercise"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the exercise details below."
              : "Fill in the details to create a new exercise."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="exercise-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
        >
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Barbell Back Squat"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of the exercise…"
              rows={4}
              className="resize-none"
              {...register("description")}
            />
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) =>
                setValue("visibility", v as "public" | "private", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="visibility" className="w-full">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image */}
          <div className="flex flex-col gap-1.5">
            <Label>Image</Label>
            {imagePreview ? (
              <div className="relative w-full overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted"
              >
                <ImageIcon className="size-5" />
                <span className="text-xs">Click to upload image</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <p className="text-xs text-muted-foreground">Max 5MB. JPG, PNG, WebP.</p>
          </div>

          {/* Muscles */}
          <div className="flex flex-col gap-1.5">
            <div>
              <Label>Muscles worked</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select the muscles this exercise targets and how much each is
                worked.
              </p>
            </div>
            <ExerciseMusclesField
              value={exerciseMuscles}
              onChange={setExerciseMuscles}
            />
            {isEdit && isLoadingDetail && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Loading current muscles…
              </p>
            )}
          </div>
        </form>

        <SheetFooter className="border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="exercise-form" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create exercise"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
