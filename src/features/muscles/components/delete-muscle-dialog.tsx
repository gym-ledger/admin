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
import { useDeleteMuscle } from "@/features/muscles/hooks/use-muscles";
import type { Muscle } from "@/features/muscles/types";

interface DeleteMuscleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muscle: Muscle | null;
}

export function DeleteMuscleDialog({
  open,
  onOpenChange,
  muscle,
}: DeleteMuscleDialogProps) {
  const deleteMutation = useDeleteMuscle();

  async function handleDelete() {
    if (!muscle) return;
    await deleteMutation.mutateAsync(muscle.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete muscle</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{muscle?.name}</span>?
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
