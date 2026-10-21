import { apiClient } from "@/lib/api-client";
import type { PaginatedData } from "@/types/api";
import type { Account, ActiveSessions, AdminSession } from "@/features/account/types";

export async function getAccount(): Promise<Account> {
  return apiClient.get<Account>("/admin/account");
}

/** The active sign-ins (at most `max_active_sessions`). */
export async function listActiveSessions(): Promise<ActiveSessions> {
  return apiClient.get<ActiveSessions>("/admin/account/sessions");
}

/** Every sign-in ever, newest first. */
export async function listAllSessions(page: number, limit: number): Promise<PaginatedData<AdminSession>> {
  return apiClient.get<PaginatedData<AdminSession>>(
    `/admin/account/sessions?scope=all&page=${page}&limit=${limit}`,
  );
}

export async function signOutSession(id: string): Promise<void> {
  await apiClient.delete<null>(`/admin/account/sessions/${id}`);
}

export async function signOutOtherSessions(): Promise<{ signed_out: number }> {
  return apiClient.post<{ signed_out: number }>("/admin/account/sessions/sign-out-others");
}

/** Signs every other device out too. */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ password_changed_at: string; signed_out: number }> {
  return apiClient.put<{ password_changed_at: string; signed_out: number }>("/admin/account/password", data);
}
