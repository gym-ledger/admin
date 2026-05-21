import { apiClient } from "@/lib/api-client";
import type { PaginatedData } from "@/types/api";
import type {
  WorkoutProgram,
  ProgramWithDetails,
  ProgramBuilderDay,
  SplitType,
  SessionOrderingLogic,
  DurationType,
} from "@/features/programs/types";

export interface ListWorkoutProgramsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function listWorkoutPrograms(
  params: ListWorkoutProgramsParams = {},
): Promise<PaginatedData<WorkoutProgram>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return apiClient.get<PaginatedData<WorkoutProgram>>(
    `/admin/crud/workout-programs/list${qs ? `?${qs}` : ""}`,
  );
}

export async function getWorkoutProgram(id: string): Promise<ProgramWithDetails> {
  return apiClient.get<ProgramWithDetails>(`/admin/crud/workout-programs/view/${id}`);
}

export interface CreateWorkoutProgramPayload {
  name: string;
  description?: string;
  visibility?: "public" | "private";
  split_type?: SplitType;
  session_ordering_logic?: SessionOrderingLogic;
  duration_type?: DurationType;
  duration_weeks?: number;
  version_visibility?: "public" | "private";
  program_days?: ProgramBuilderDay[];
}

export async function createWorkoutProgram(
  payload: CreateWorkoutProgramPayload,
): Promise<WorkoutProgram> {
  return apiClient.post<WorkoutProgram>("/admin/crud/workout-programs/create", payload);
}

export interface UpdateWorkoutProgramPayload extends CreateWorkoutProgramPayload {
  id: string;
}

export async function updateWorkoutProgram(
  payload: UpdateWorkoutProgramPayload,
): Promise<WorkoutProgram> {
  const { id, ...rest } = payload;
  return apiClient.put<WorkoutProgram>(`/admin/crud/workout-programs/update/${id}`, rest);
}

export async function deleteWorkoutProgram(id: string): Promise<WorkoutProgram> {
  return apiClient.delete<WorkoutProgram>(`/admin/crud/workout-programs/delete/${id}`);
}
