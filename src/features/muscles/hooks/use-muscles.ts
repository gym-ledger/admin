import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listMuscles,
  getMuscle,
  createMuscle,
  updateMuscle,
  deleteMuscle,
  getMusclesDropdown,
  importMuscles,
  exportMuscles,
  type ListMusclesParams,
  type ListMusclesDropdownParams,
  type MusclePayload,
  type UpdateMusclePayload,
} from "@/features/muscles/services/muscles.service";
import { getErrorMessage } from "@/types/api";

export const muscleKeys = {
  all: ["muscles"] as const,
  list: (params: ListMusclesParams) => ["muscles", "list", params] as const,
  detail: (id: string) => ["muscles", "detail", id] as const,
  dropdown: (params: ListMusclesDropdownParams) =>
    ["muscles", "dropdown", params] as const,
};

export function useMuscles(params: ListMusclesParams = {}) {
  return useQuery({
    queryKey: muscleKeys.list(params),
    queryFn: () => listMuscles(params),
  });
}

export function useMuscle(id: string | null) {
  return useQuery({
    queryKey: muscleKeys.detail(id ?? ""),
    queryFn: () => getMuscle(id as string),
    enabled: !!id,
  });
}

export function useMusclesDropdown(params: ListMusclesDropdownParams = {}) {
  return useQuery({
    queryKey: muscleKeys.dropdown(params),
    queryFn: () => getMusclesDropdown(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateMuscle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MusclePayload) => createMuscle(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: muscleKeys.all });
      toast.success("Muscle created");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateMuscle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMusclePayload) => updateMuscle(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: muscleKeys.all });
      toast.success("Muscle updated");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteMuscle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMuscle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: muscleKeys.all });
      toast.success("Muscle deleted");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useImportMuscles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importMuscles(file),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: muscleKeys.all });
      if (data.totalErrors > 0) {
        toast.warning(
          `Imported ${data.success} muscle${data.success !== 1 ? "s" : ""} with ${data.totalErrors} error${data.totalErrors !== 1 ? "s" : ""}`,
        );
      } else {
        toast.success(
          `Imported ${data.success} muscle${data.success !== 1 ? "s" : ""}`,
        );
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useExportMuscles() {
  return useMutation({
    mutationFn: () => exportMuscles(),
    onSuccess: () => {
      toast.success("CSV downloaded");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
