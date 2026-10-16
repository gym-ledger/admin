export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/**
 * What the client holds after sign-in. The refresh token is not here: the API
 * keeps it in an httpOnly cookie that page JavaScript can never read.
 */
export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: number;
}

export type AuthBroadcastEvent =
  | { type: "TOKEN_REFRESHED"; accessToken: string; accessTokenExpiresAt: number }
  | { type: "LOGGED_OUT" };
