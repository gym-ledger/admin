"use client";

import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgramBuilder } from "@/features/programs/context/program-builder.context";
import { SessionCard } from "./session-card";
import { DAY_LABELS, DAY_FULL_NAMES } from "@/features/programs/types";

export function DayTabs() {
  const { state, dispatch } = useProgramBuilder();

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Days &amp; Sessions
        </h2>
      </div>

      <Tabs defaultValue="0" className="p-0">
        <div className="overflow-x-auto border-b border-border px-5 pt-3">
          <TabsList variant="line" className="gap-0">
            {state.days.map((_, i) => (
              <TabsTrigger key={i} value={String(i)} className="px-3 text-xs font-semibold">
                {DAY_LABELS[i]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {state.days.map((day, dayIndex) => (
          <TabsContent key={dayIndex} value={String(dayIndex)} className="m-0 p-5">
            {/* Day name */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor={`day-name-${dayIndex}`} className="text-xs text-muted-foreground">
                  {DAY_FULL_NAMES[dayIndex]} — Day label (optional)
                </Label>
                <Input
                  id={`day-name-${dayIndex}`}
                  placeholder={`e.g. Push Day, Legs, Upper Body…`}
                  value={day.name}
                  onChange={(e) => dispatch({ type: "SET_DAY_NAME", dayIndex, value: e.target.value })}
                  className="w-64"
                />
              </div>
            </div>

            {/* Sessions */}
            <div className="flex flex-col gap-3">
              {day.sessions.map((session) => (
                <SessionCard
                  key={session.tempId}
                  dayIndex={dayIndex}
                  session={session}
                  canDelete={day.sessions.length > 1}
                />
              ))}
            </div>

            {/* Add session button */}
            {day.sessions.length < 4 && (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-dashed text-muted-foreground"
                  onClick={() => dispatch({ type: "ADD_SESSION", dayIndex })}
                >
                  <Plus className="size-4" />
                  Add session
                  <span className="text-xs text-muted-foreground/60">
                    ({day.sessions.length}/4)
                  </span>
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

    </div>
  );
}
