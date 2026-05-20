import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  type ListExercisesParams,
  type CreateExercisePayload,
  type UpdateExercisePayload,
} from "@/features/exercises/services/exercises.service";
import { getErrorMessage } from "@/types/api";

export const exerciseKeys = {
  all: ["exercises"] as const,
  list: (params: ListExercisesParams) => ["exercises", "list", params] as const,
};

export function useExercises(params: ListExercisesParams = {}) {
  return useQuery({
    queryKey: exerciseKeys.list(params),
    queryFn: () => listExercises(params),
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExercisePayload) => createExercise(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exerciseKeys.all });
      toast.success("Exercise created");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateExercisePayload) => updateExercise(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exerciseKeys.all });
      toast.success("Exercise updated");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exerciseKeys.all });
      toast.success("Exercise deleted");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
