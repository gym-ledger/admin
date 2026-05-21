import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listWorkoutPrograms,
  getWorkoutProgram,
  createWorkoutProgram,
  updateWorkoutProgram,
  deleteWorkoutProgram,
  type ListWorkoutProgramsParams,
  type CreateWorkoutProgramPayload,
  type UpdateWorkoutProgramPayload,
} from "@/features/programs/components/services/programs.service";
import { getErrorMessage } from "@/types/api";

export const programKeys = {
  all: ["workout-programs"] as const,
  list: (params: ListWorkoutProgramsParams) => ["workout-programs", "list", params] as const,
  detail: (id: string) => ["workout-programs", "detail", id] as const,
};

export function usePrograms(params: ListWorkoutProgramsParams = {}) {
  return useQuery({
    queryKey: programKeys.list(params),
    queryFn: () => listWorkoutPrograms(params),
  });
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => getWorkoutProgram(id),
    enabled: !!id,
  });
}

export function useCreateProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkoutProgramPayload) => createWorkoutProgram(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programKeys.all });
      toast.success("Program created");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkoutProgramPayload) => updateWorkoutProgram(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programKeys.all });
      toast.success("Program updated");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkoutProgram(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programKeys.all });
      toast.success("Program deleted");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
