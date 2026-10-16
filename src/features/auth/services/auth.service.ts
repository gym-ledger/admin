import { apiClient } from "@/lib/api-client";
import type { AdminUser } from "@/stores/auth.store";

/** The refresh token isn't here: the API sets it as an httpOnly cookie. */
export interface LoginResponse {
  admin: AdminUser;
  accessToken: string;
  accessTokenExpiresAt: string;
}

export async function loginAdmin(credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/admin/auth/login", credentials);
}
