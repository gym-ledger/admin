export interface Account {
  admin: {
    id: string;
    email: string;
    created_at: string;
    password_changed_at: string | null;
  };
  /** Sign-ins allowed at once; a new one signs out the least recently used. */
  max_active_sessions: number;
  password_min_length: number;
}

export type SessionEndReason =
  | "logout"
  | "signed_out_remotely"
  | "signed_out_others"
  | "password_changed"
  | "session_limit"
  | "token_reused";

export interface AdminSession {
  id: string;
  status: "active" | "expired" | "ended";
  ended_reason: SessionEndReason | null;
  ended_at: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  /** At sign-in. */
  ip_address: string | null;
  /** At the latest token refresh. */
  last_ip_address: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device_type: "desktop" | "mobile" | "tablet" | "unknown";
  /** From Cloudflare's location headers; null when the API isn't behind Cloudflare. */
  city: string | null;
  region: string | null;
  country: string | null;
  /** The device you're using now. */
  current: boolean;
}

export interface ActiveSessions {
  data: AdminSession[];
  meta: { max_active_sessions: number };
}

export type SessionScope = "active" | "all";
