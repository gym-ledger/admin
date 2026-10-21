import { apiClient } from "@/lib/api-client";
import type { PaginatedData } from "@/types/api";
import type { Exercise, ExerciseDetail, ExerciseExportRow } from "@/features/exercises/types";

export interface ImportResult {
  success: Exercise[];
  errors: { row: number; message: string }[];
}

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

export async function getExercise(id: string): Promise<ExerciseDetail> {
  return apiClient.get<ExerciseDetail>(`/admin/crud/exercises/view/${id}`);
}

export interface ExerciseMusclePayload {
  muscle_id: string;
  contribution: number;
}

export interface CreateExercisePayload {
  name: string;
  description?: string;
  visibility?: "public" | "private";
  image?: File;
  /** The full set of muscles this exercise targets, with their contribution (0–1]. */
  exerciseMuscles: ExerciseMusclePayload[];
}

export async function createExercise(
  payload: CreateExercisePayload,
): Promise<Exercise> {
  const form = new FormData();
  form.append("name", payload.name);
  if (payload.description) form.append("description", payload.description);
  if (payload.visibility) form.append("visibility", payload.visibility);
  if (payload.image) form.append("image", payload.image);
  form.append("exerciseMuscles", JSON.stringify(payload.exerciseMuscles));
  return apiClient.post<Exercise>("/admin/crud/exercises/create", form);
}

export interface UpdateExercisePayload extends Partial<Omit<CreateExercisePayload, "exerciseMuscles">> {
  id: string;
  /** Full desired muscle set — anything omitted here is unlinked. */
  exerciseMuscles: ExerciseMusclePayload[];
  /** Deletes the current image (ignored when a new `image` is sent). */
  removeImage?: boolean;
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
  else if (rest.removeImage) form.append("remove_image", "true");
  form.append("exerciseMuscles", JSON.stringify(rest.exerciseMuscles));
  return apiClient.put<Exercise>(`/admin/crud/exercises/update/${id}`, form);
}

export async function deleteExercise(id: string): Promise<Exercise> {
  return apiClient.delete<Exercise>(`/admin/crud/exercises/delete/${id}`);
}

export async function importExercises(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);
  return apiClient.post<ImportResult>("/admin/crud/exercises/import", form);
}

// Columns match the CSV cells `importExercises` reads back — "exerciseMuscles"
// is a "slug:contribution,slug:contribution" cell, and "id" lets a re-import
// of an edited export update the same exercises instead of duplicating them.
const CSV_COLUMNS: (keyof ExerciseExportRow)[] = [
  "id",
  "name",
  "slug",
  "description",
  "visibility",
  "exerciseMuscles",
];

function toCSV(rows: ExerciseExportRow[]): string {
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    CSV_COLUMNS.join(","),
    ...rows.map((r) => CSV_COLUMNS.map((col) => escape(r[col])).join(",")),
  ];
  return lines.join("\n");
}

export async function exportExercises(): Promise<void> {
  const exercises = await apiClient.get<ExerciseExportRow[]>("/admin/crud/exercises/export");
  const csv = toCSV(exercises);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exercises-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
