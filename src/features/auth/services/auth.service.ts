import { apiClient } from "@/lib/api-client";
import type { AdminUser } from "@/stores/auth.store";

export interface LoginResponse {
  admin: AdminUser;
  accessToken: string;
  refreshToken: string;
}

export async function loginAdmin(credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/admin/auth/login", credentials);
}
