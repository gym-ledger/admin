"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProgressionRule } from "@/features/progression-rules/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule: ProgressionRule | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteProgressionRuleDialog({ open, onOpenChange, rule, onConfirm, isDeleting = false }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete progression rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{rule?.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <span className="mr-1 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
