"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown, Loader2, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  muscleFormSchema,
  type MuscleFormInput,
} from "@/features/muscles/schemas/muscle.schema";
import {
  useCreateMuscle,
  useUpdateMuscle,
  useMuscle,
  useMusclesDropdown,
} from "@/features/muscles/hooks/use-muscles";
import type { Muscle } from "@/features/muscles/types";

interface MuscleFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muscle?: Muscle | null;
}

interface Linked {
  id: string;
  name: string;
}

export function MuscleFormDrawer({
  open,
  onOpenChange,
  muscle,
}: MuscleFormDrawerProps) {
  const isEdit = !!muscle;
  const createMutation = useCreateMuscle();
  const updateMutation = useUpdateMuscle();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: detail, isLoading: isLoadingDetail } = useMuscle(
    open && muscle ? muscle.id : null,
  );

  const [parentMuscle, setParentMuscle] = useState<Linked | null>(null);
  const [childrenMuscles, setChildrenMuscles] = useState<Linked[]>([]);

  const [parentPickerOpen, setParentPickerOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [debouncedParentSearch, setDebouncedParentSearch] = useState("");

  const [childPickerOpen, setChildPickerOpen] = useState(false);
  const [childSearch, setChildSearch] = useState("");
  const [debouncedChildSearch, setDebouncedChildSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedParentSearch(parentSearch), 300);
    return () => clearTimeout(t);
  }, [parentSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedChildSearch(childSearch), 300);
    return () => clearTimeout(t);
  }, [childSearch]);

  useEffect(() => {
    if (!parentPickerOpen) setParentSearch("");
  }, [parentPickerOpen]);

  useEffect(() => {
    if (!childPickerOpen) setChildSearch("");
  }, [childPickerOpen]);

  const excludeIds = [
    ...(muscle ? [muscle.id] : []),
    ...childrenMuscles.map((c) => c.id),
    ...(parentMuscle ? [parentMuscle.id] : []),
  ];

  const { data: parentOptions, isLoading: parentOptionsLoading } =
    useMusclesDropdown({ search: debouncedParentSearch || undefined, limit: 20 });
  const { data: childOptions, isLoading: childOptionsLoading } =
    useMusclesDropdown({ search: debouncedChildSearch || undefined, limit: 20 });

  const filteredParentOptions = (parentOptions?.data ?? []).filter(
    (m) => !excludeIds.includes(m.id),
  );
  const filteredChildOptions = (childOptions?.data ?? []).filter(
    (m) => !excludeIds.includes(m.id),
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MuscleFormInput>({
    resolver: zodResolver(muscleFormSchema),
    defaultValues: {
      name: "",
      body_region: "",
      display_order: "0",
      xp_enabled: false,
      recovery_enabled: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (!muscle) {
      reset({
        name: "",
        body_region: "",
        display_order: "0",
        xp_enabled: false,
        recovery_enabled: false,
      });
      setParentMuscle(null);
      setChildrenMuscles([]);
      return;
    }
    reset({
      name: muscle.name,
      body_region: muscle.body_region ?? "",
      display_order: String(muscle.display_order),
      xp_enabled: muscle.xp_enabled,
      recovery_enabled: muscle.recovery_enabled,
    });
  }, [open, muscle, reset]);

  useEffect(() => {
    if (!open || !detail) return;
    setParentMuscle(
      detail.parentMuscle
        ? { id: detail.parentMuscle.id, name: detail.parentMuscle.name }
        : null,
    );
    setChildrenMuscles(
      detail.childrenMuscles.map((c) => ({ id: c.id, name: c.name })),
    );
  }, [open, detail]);

  function selectParent(id: string, name: string) {
    setParentMuscle({ id, name });
    setChildrenMuscles([]);
    setParentPickerOpen(false);
  }

  function clearParent() {
    setParentMuscle(null);
  }

  function addChild(id: string, name: string) {
    setParentMuscle(null);
    setChildrenMuscles((prev) => [...prev, { id, name }]);
    setChildPickerOpen(false);
  }

  function removeChild(id: string) {
    setChildrenMuscles((prev) => prev.filter((c) => c.id !== id));
  }

  const xpEnabled = watch("xp_enabled");
  const recoveryEnabled = watch("recovery_enabled");

  async function onSubmit(data: MuscleFormInput) {
    const payload = {
      name: data.name,
      body_region: data.body_region || null,
      display_order: parseInt(data.display_order, 10),
      xp_enabled: data.xp_enabled,
      recovery_enabled: data.recovery_enabled,
      parent_muscle_id: parentMuscle?.id ?? null,
      children_muscles: childrenMuscles.map((c) => c.id),
    };

    if (isEdit && muscle) {
      await updateMutation.mutateAsync({ id: muscle.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-lg"
        showCloseButton={false}
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? "Edit muscle" : "New muscle"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the muscle details below."
              : "Fill in the details to create a new muscle."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="muscle-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
        >
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="muscle-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="muscle-name"
              placeholder="e.g. Latissimus Dorsi"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Body region */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="muscle-body-region">Body region</Label>
            <Input
              id="muscle-body-region"
              placeholder="e.g. Back, Legs, Core"
              {...register("body_region")}
            />
          </div>

          {/* Display order */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="muscle-display-order">
              Display order <span className="text-destructive">*</span>
            </Label>
            <Input
              id="muscle-display-order"
              type="number"
              min={0}
              aria-invalid={!!errors.display_order}
              {...register("display_order")}
            />
            {errors.display_order && (
              <p className="text-xs text-destructive">
                {errors.display_order.message}
              </p>
            )}
          </div>

          {/* Flags */}
          <div className="flex flex-col gap-2.5">
            <Label>Flags</Label>
            <label className="group/field flex items-center gap-2 text-sm">
              <Checkbox
                checked={xpEnabled}
                onCheckedChange={(v) =>
                  setValue("xp_enabled", v === true, { shouldValidate: true })
                }
              />
              XP enabled
            </label>
            <label className="group/field flex items-center gap-2 text-sm">
              <Checkbox
                checked={recoveryEnabled}
                onCheckedChange={(v) =>
                  setValue("recovery_enabled", v === true, {
                    shouldValidate: true,
                  })
                }
              />
              Recovery tracking enabled
            </label>
          </div>

          {/* Hierarchy */}
          <div className="flex flex-col gap-2.5 rounded-lg border border-border p-3">
            <div>
              <Label>Hierarchy</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                A muscle can have a parent, or children, but not both.
              </p>
            </div>

            {/* Parent muscle */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Parent muscle
              </Label>
              {parentMuscle ? (
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm">
                  <span className="font-medium text-foreground">
                    {parentMuscle.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={clearParent}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <Popover open={parentPickerOpen} onOpenChange={setParentPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between font-normal"
                      disabled={childrenMuscles.length > 0}
                    >
                      <span className="text-muted-foreground">
                        {childrenMuscles.length > 0
                          ? "Clear children to set a parent"
                          : "Search muscles…"}
                      </span>
                      <ChevronsUpDown className="size-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Type to search…"
                        value={parentSearch}
                        onValueChange={setParentSearch}
                      />
                      <CommandList>
                        {parentOptionsLoading ? (
                          <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                            <Loader2 className="size-3.5 animate-spin" />
                            Searching…
                          </div>
                        ) : filteredParentOptions.length === 0 ? (
                          <CommandEmpty>
                            {debouncedParentSearch
                              ? `No muscles matching "${debouncedParentSearch}".`
                              : "No muscles found."}
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {filteredParentOptions.map((m) => (
                              <CommandItem
                                key={m.id}
                                value={m.id}
                                onSelect={() => selectParent(m.id, m.name)}
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
              )}
            </div>

            {/* Children muscles */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Children muscles
              </Label>
              {childrenMuscles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {childrenMuscles.map((c) => (
                    <Badge key={c.id} variant="outline" className="gap-1 pr-1">
                      {c.name}
                      <button
                        type="button"
                        onClick={() => removeChild(c.id)}
                        className="rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Popover open={childPickerOpen} onOpenChange={setChildPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                    disabled={!!parentMuscle}
                  >
                    <span className="text-muted-foreground">
                      {parentMuscle
                        ? "Clear parent to add children"
                        : "Add a child muscle…"}
                    </span>
                    <ChevronsUpDown className="size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Type to search…"
                      value={childSearch}
                      onValueChange={setChildSearch}
                    />
                    <CommandList>
                      {childOptionsLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          Searching…
                        </div>
                      ) : filteredChildOptions.length === 0 ? (
                        <CommandEmpty>
                          {debouncedChildSearch
                            ? `No muscles matching "${debouncedChildSearch}".`
                            : "No muscles found."}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredChildOptions.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={m.id}
                              onSelect={() => addChild(m.id, m.name)}
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

            {isEdit && isLoadingDetail && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Loading current hierarchy…
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
          <Button type="submit" form="muscle-form" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create muscle"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
