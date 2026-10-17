import { apiClient } from "@/lib/api-client";
import type { PaginatedData } from "@/types/api";
import type {
  UserActivityFilter,
  UserDetail,
  UserListItem,
  UserSort,
} from "@/features/users/types";

export interface ListUsersParams {
  page?: number;
  limit?: number;
  /** Matches email, phone (digits only) or name. */
  search?: string;
  sort?: UserSort;
  order?: "asc" | "desc";
  activity?: UserActivityFilter | null;
  hasPlan?: boolean;
}

export async function listUsers(
  params: ListUsersParams = {},
): Promise<PaginatedData<UserListItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.activity) query.set("activity", params.activity);
  if (params.hasPlan) query.set("hasPlan", "true");
  const qs = query.toString();
  return apiClient.get<PaginatedData<UserListItem>>(
    `/admin/analytics/users/list${qs ? `?${qs}` : ""}`,
  );
}

export async function getUser(id: string): Promise<UserDetail> {
  return apiClient.get<UserDetail>(`/admin/analytics/users/view/${id}`);
}
