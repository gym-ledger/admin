import { apiClient } from "@/lib/api-client";
import type { PaginatedData } from "@/types/api";
import type { Muscle, MuscleDetail, MuscleDropdownItem } from "@/features/muscles/types";

export interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
  totalErrors: number;
}

export interface ListMusclesParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Only top-level (no parent) muscles. */
  parentsOnly?: boolean;
}

/**
 * Returns muscles pre-ordered as: parent, then its children (by
 * display_order), then the next parent, etc. When `search` is set, only
 * matching rows are returned but they keep the same relative hierarchical
 * order.
 */
export async function listMuscles(
  params: ListMusclesParams = {},
): Promise<PaginatedData<Muscle>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.parentsOnly) query.set("parentsOnly", "true");
  const qs = query.toString();
  return apiClient.get<PaginatedData<Muscle>>(
    `/admin/crud/muscles/list${qs ? `?${qs}` : ""}`,
  );
}

export async function getMuscle(id: string): Promise<MuscleDetail> {
  return apiClient.get<MuscleDetail>(`/admin/crud/muscles/view/${id}`);
}

export interface MusclePayload {
  name: string;
  parent_muscle_id: string | null;
  xp_enabled: boolean;
  recovery_enabled: boolean;
  body_region: string | null;
  display_order: number;
  children_muscles?: string[];
}

export async function createMuscle(payload: MusclePayload): Promise<Muscle> {
  return apiClient.post<Muscle>("/admin/crud/muscles/create", payload);
}

export interface UpdateMusclePayload extends MusclePayload {
  id: string;
}

export async function updateMuscle(
  payload: UpdateMusclePayload,
): Promise<Muscle> {
  const { id, ...rest } = payload;
  return apiClient.put<Muscle>(`/admin/crud/muscles/update/${id}`, rest);
}

export async function deleteMuscle(id: string): Promise<Muscle> {
  return apiClient.delete<Muscle>(`/admin/crud/muscles/delete/${id}`);
}

export interface ListMusclesDropdownParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getMusclesDropdown(
  params: ListMusclesDropdownParams = {},
): Promise<PaginatedData<MuscleDropdownItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return apiClient.get<PaginatedData<MuscleDropdownItem>>(
    `/admin/crud/muscles/dropdown${qs ? `?${qs}` : ""}`,
  );
}

export async function importMuscles(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);
  return apiClient.post<ImportResult>("/admin/crud/muscles/import", form);
}

const CSV_COLUMNS: (keyof Muscle)[] = [
  "name",
  "slug",
  "parent_muscle_id",
  "xp_enabled",
  "recovery_enabled",
  "body_region",
  "display_order",
];

function toCSV(rows: Muscle[]): string {
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

export async function exportMuscles(): Promise<void> {
  const muscles = await apiClient.get<Muscle[]>("/admin/crud/muscles/export");
  const csv = toCSV(muscles);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `muscles-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
