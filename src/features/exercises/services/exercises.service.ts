import { apiClient } from "@/lib/api-client";
import type { PaginatedData } from "@/types/api";
import type { Exercise } from "@/features/exercises/types";

export interface ListExercisesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function listExercises(
  params: ListExercisesParams = {},
): Promise<PaginatedData<Exercise>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return apiClient.get<PaginatedData<Exercise>>(
    `/admin/crud/exercises/list${qs ? `?${qs}` : ""}`,
  );
}

export async function getExercise(id: string): Promise<Exercise> {
  return apiClient.get<Exercise>(`/admin/crud/exercises/view/${id}`);
}

export interface CreateExercisePayload {
  name: string;
  description?: string;
  visibility?: "public" | "private";
  image?: File;
}

export async function createExercise(
  payload: CreateExercisePayload,
): Promise<Exercise> {
  const form = new FormData();
  form.append("name", payload.name);
  if (payload.description) form.append("description", payload.description);
  if (payload.visibility) form.append("visibility", payload.visibility);
  if (payload.image) form.append("image", payload.image);
  return apiClient.post<Exercise>("/admin/crud/exercises/create", form);
}

export interface UpdateExercisePayload extends Partial<CreateExercisePayload> {
  id: string;
}

export async function updateExercise(
  payload: UpdateExercisePayload,
): Promise<Exercise> {
  const { id, ...rest } = payload;
  const form = new FormData();
  if (rest.name) form.append("name", rest.name);
  if (rest.description) form.append("description", rest.description);
  if (rest.visibility) form.append("visibility", rest.visibility);
  if (rest.image) form.append("image", rest.image);
  return apiClient.put<Exercise>(`/admin/crud/exercises/update/${id}`, form);
}

export async function deleteExercise(id: string): Promise<Exercise> {
  return apiClient.delete<Exercise>(`/admin/crud/exercises/delete/${id}`);
}
