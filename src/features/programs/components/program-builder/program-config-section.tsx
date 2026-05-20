"use client";

import { useProgramBuilder } from "@/features/programs/context/program-builder.context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPLIT_TYPE_LABELS, SESSION_ORDERING_LABELS } from "@/features/programs/types";

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export function ProgramConfigSection() {
  const { state, dispatch } = useProgramBuilder();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Column 1: Program Info */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Program Info</h2>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prog-name">Name <span className="text-destructive">*</span></Label>
          <Input
            id="prog-name"
            placeholder="e.g. Hypertrophy PPL 8-Week"
            value={state.name}
            onChange={(e) => dispatch({ type: "SET_NAME", value: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prog-vis">Visibility</Label>
          <Select value={state.visibility} onValueChange={(v) => dispatch({ type: "SET_VISIBILITY", value: v as "public" | "private" })}>
            <SelectTrigger id="prog-vis" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prog-desc">Version Description</Label>
          <Textarea
            id="prog-desc"
            placeholder="Describe this program version…"
            rows={3}
            className="resize-none"
            value={state.description}
            onChange={(e) => dispatch({ type: "SET_DESCRIPTION", value: e.target.value })}
          />
        </div>
      </div>

      {/* Column 2: Version Config */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Version Config</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Training Days / Week</Label>
            <div className="flex gap-1">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => dispatch({ type: "SET_TRAINING_DAYS", value: d })}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                    state.training_days === d
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-border bg-background text-muted-foreground hover:border-indigo-300 hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Split Type</Label>
            <Select value={state.split_type} onValueChange={(v) => dispatch({ type: "SET_SPLIT_TYPE", value: v as any })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SPLIT_TYPE_LABELS) as [string, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Session Ordering</Label>
            <Select value={state.session_ordering_logic} onValueChange={(v) => dispatch({ type: "SET_SESSION_ORDERING", value: v as any })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SESSION_ORDERING_LABELS) as [string, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Duration</Label>
            <Select value={state.duration_type} onValueChange={(v) => dispatch({ type: "SET_DURATION_TYPE", value: v as any })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finite">Finite</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {state.duration_type === "finite" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dur-weeks">Duration (weeks)</Label>
            <Input
              id="dur-weeks"
              type="number"
              min={1}
              max={52}
              className="w-32"
              value={state.duration_weeks}
              onChange={(e) => dispatch({ type: "SET_DURATION_WEEKS", value: Number(e.target.value) })}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label>Version Visibility</Label>
          <Select value={state.version_visibility} onValueChange={(v) => dispatch({ type: "SET_VERSION_VISIBILITY", value: v as "public" | "private" })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
