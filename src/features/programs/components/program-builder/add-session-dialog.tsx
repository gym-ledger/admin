"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (name: string) => void;
}

const SUGGESTED_NAMES = ["Morning", "Afternoon", "Evening", "Night"];

export function AddSessionDialog({ open, onOpenChange, onConfirm }: Props) {
  const [name, setName] = useState("");

  function handleConfirm() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setName("");
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setName(""); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Add session</DialogTitle>
          <DialogDescription>Name this training session (e.g. Morning, Evening).</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-name">Session name</Label>
          <Input
            id="session-name"
            placeholder="e.g. Morning"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTED_NAMES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setName(s)}
                className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!name.trim()}>Add session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
