export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
}

export type AuthBroadcastEvent =
  | { type: "TOKEN_REFRESHED"; accessToken: string; accessTokenExpiresAt: number }
  | { type: "REFRESH_TOKEN_ROTATED"; refreshToken: string }
  | { type: "LOGGED_OUT" };
