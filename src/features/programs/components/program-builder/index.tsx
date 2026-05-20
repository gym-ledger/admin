"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramBuilderProvider, useProgramBuilder } from "@/features/programs/context/program-builder.context";
import { ProgramConfigSection } from "./program-config-section";
import { DayTabs } from "./day-tabs";

function BuilderInner() {
  const router = useRouter();
  const { state, dispatch } = useProgramBuilder();

  function handleSave() {
    if (!state.name.trim()) {
      toast.error("Program name is required");
      return;
    }
    const activeDays = state.days.slice(0, state.training_days);
    for (const day of activeDays) {
      for (const session of day.sessions) {
        if (session.exercises.length === 0) {
          toast.error(`Session "${session.name}" has no exercises. Add at least one.`);
          return;
        }
      }
    }
    console.log("Program draft:", JSON.stringify(state, null, 2));
    toast.success("Program saved (API integration pending)");
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-zinc-50 px-6">
        <div>
          <h1 className="text-sm font-semibold text-foreground">New Workout Program</h1>
          <p className="text-xs text-muted-foreground">
            {state.training_days} day{state.training_days !== 1 ? "s" : ""} / week
            {state.name && <> · <span className="text-foreground">{state.name}</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { dispatch({ type: "RESET" }); router.push("/programs"); }}
          >
            <X className="size-4" /> Discard
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="size-4" /> Save program
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

export function ProgramBuilder() {
  return (
    <ProgramBuilderProvider>
      <BuilderInner />
    </ProgramBuilderProvider>
  );
}
