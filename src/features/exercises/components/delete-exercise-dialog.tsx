"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteExercise } from "@/features/exercises/hooks/use-exercises";
import type { Exercise } from "@/features/exercises/types";

interface DeleteExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise | null;
}

export function DeleteExerciseDialog({
  open,
  onOpenChange,
  exercise,
}: DeleteExerciseDialogProps) {
  const deleteMutation = useDeleteExercise();

  async function handleDelete() {
    if (!exercise) return;
    await deleteMutation.mutateAsync(exercise.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete exercise</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{exercise?.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
