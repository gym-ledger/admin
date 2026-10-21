import { Monitor, Smartphone, Tablet, HelpCircle } from "lucide-react";
import type { AdminSession, SessionEndReason } from "@/features/account/types";

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: HelpCircle,
} as const;

export function DeviceIcon({ type, className }: { type: AdminSession["device_type"]; className?: string }) {
  const Icon = DEVICE_ICONS[type] ?? HelpCircle;
  return <Icon className={className} aria-hidden />;
}

/** "Chrome 141 on Windows", falling back to whatever is known. */
export function deviceName(s: AdminSession): string {
  if (s.browser && s.os) return `${s.browser} on ${s.os}`;
  return s.browser ?? s.os ?? "Unknown device";
}

let countryNames: Intl.DisplayNames | null = null;
function countryName(code: string): string {
  try {
    countryNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "Mumbai, Maharashtra, India", or null when the API had no location headers. */
export function sessionLocation(s: AdminSession): string | null {
  const parts = [s.city, s.region, s.country ? countryName(s.country) : null].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

const END_REASONS: Record<SessionEndReason, string> = {
  logout: "Logged out",
  signed_out_remotely: "Signed out from another device",
  signed_out_others: "Signed out (all other devices)",
  password_changed: "Signed out (password changed)",
  session_limit: "Replaced by a newer sign-in",
  token_reused: "Signed out (old sign-in token reused)",
};

export function sessionStatusLabel(s: AdminSession): string {
  if (s.status === "active") return "Active";
  if (s.status === "expired") return "Expired";
  return s.ended_reason ? END_REASONS[s.ended_reason] : "Signed out";
}
