"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown, Loader2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMusclesDropdown } from "@/features/muscles/hooks/use-muscles";

export interface ExerciseMuscleSelection {
  muscle_id: string;
  muscleName: string;
  /** Whole percentage, 1–100. Converted to a 0–1 fraction at submit time. */
  contributionPercent: number;
}

interface ExerciseMusclesFieldProps {
  value: ExerciseMuscleSelection[];
  onChange: (value: ExerciseMuscleSelection[]) => void;
}

export function ExerciseMusclesField({
  value,
  onChange,
}: ExerciseMusclesFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  function handlePickerOpenChange(next: boolean) {
    setPickerOpen(next);
    if (!next) setSearch("");
  }

  const selectedIds = value.map((v) => v.muscle_id);
  const { data, isLoading } = useMusclesDropdown({
    search: debouncedSearch || undefined,
    limit: 20,
  });
  const options = (data?.data ?? []).filter((m) => !selectedIds.includes(m.id));

  function addMuscle(id: string, name: string) {
    onChange([...value, { muscle_id: id, muscleName: name, contributionPercent: 100 }]);
    setPickerOpen(false);
  }

  function removeMuscle(id: string) {
    onChange(value.filter((v) => v.muscle_id !== id));
  }

  function updateContribution(id: string, percent: number) {
    const clamped = Math.min(100, Math.max(1, percent));
    onChange(
      value.map((v) =>
        v.muscle_id === id ? { ...v, contributionPercent: clamped } : v,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {value.map((m) => (
            <div
              key={m.muscle_id}
              className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5"
            >
              <span className="flex-1 truncate text-sm font-medium text-foreground">
                {m.muscleName}
              </span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={m.contributionPercent}
                  onChange={(e) =>
                    updateContribution(
                      m.muscle_id,
                      parseInt(e.target.value, 10) || 1,
                    )
                  }
                  className="h-7 w-16 text-right"
                  aria-label={`${m.muscleName} contribution`}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeMuscle(m.muscle_id)}
              >
                <X className="size-3.5" />
                <span className="sr-only">Remove {m.muscleName}</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <Popover open={pickerOpen} onOpenChange={handlePickerOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            <span className="text-muted-foreground">Add a muscle…</span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search muscles…"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Searching…
                </div>
              ) : options.length === 0 ? (
                <CommandEmpty>
                  {debouncedSearch
                    ? `No muscles matching "${debouncedSearch}".`
                    : "No muscles found."}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {options.map((m) => (
                    <CommandItem
                      key={m.id}
                      value={m.id}
                      onSelect={() => addMuscle(m.id, m.name)}
                    >
                      {m.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
