export const STORAGE_KEY = "admin-auth-rt" as const;
export const BROADCAST_CHANNEL_NAME = "admin-auth" as const;
export const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60_000;
export const REFRESH_ENDPOINT = "/admin/auth/refresh-tokens" as const;
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function normalizeExpiresAt(raw: string | number): number {
  if (typeof raw === "string") return new Date(raw).getTime();
  if (raw < 1e12) return raw * 1000;
  return raw;
}

export function decodeJwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    if (payload.exp) return payload.exp * 1000;
  } catch {
    // ignore malformed token
  }
  return Date.now() + 10 * 60 * 1000;
}
