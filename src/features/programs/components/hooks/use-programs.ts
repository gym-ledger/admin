import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listWorkoutPrograms,
  getWorkoutProgram,
  listProgramVersions,
  createWorkoutProgram,
  updateWorkoutProgram,
  createProgramVersion,
  deleteWorkoutProgram,
  type ListWorkoutProgramsParams,
  type CreateWorkoutProgramPayload,
  type UpdateWorkoutProgramPayload,
  type CreateProgramVersionPayload,
} from "@/features/programs/components/services/programs.service";
import { getErrorMessage } from "@/types/api";

export const programKeys = {
  all: ["workout-programs"] as const,
  list: (params: ListWorkoutProgramsParams) => ["workout-programs", "list", params] as const,
  detail: (id: string, versionId?: string) => ["workout-programs", "detail", id, versionId ?? "latest"] as const,
  versions: (id: string) => ["workout-programs", "versions", id] as const,
};

export function usePrograms(params: ListWorkoutProgramsParams = {}) {
  return useQuery({
    queryKey: programKeys.list(params),
    queryFn: () => listWorkoutPrograms(params),
  });
}

export function useProgram(id: string, versionId?: string) {
  return useQuery({
    queryKey: programKeys.detail(id, versionId),
    queryFn: () => getWorkoutProgram(id, versionId),
    enabled: !!id,
  });
}

export function useProgramVersions(id: string) {
  return useQuery({
    queryKey: programKeys.versions(id),
    queryFn: () => listProgramVersions(id),
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

export function useCreateProgramVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgramVersionPayload) => createProgramVersion(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programKeys.all });
      toast.success("Saved as a new version");
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
