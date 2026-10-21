import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/types/api";
import {
  changePassword,
  getAccount,
  listActiveSessions,
  listAllSessions,
  signOutOtherSessions,
  signOutSession,
} from "@/features/account/services/account.service";

export const accountKeys = {
  all: ["account"] as const,
  me: ["account", "me"] as const,
  sessions: ["account", "sessions"] as const,
  activeSessions: ["account", "sessions", "active"] as const,
  allSessions: (page: number, limit: number) => ["account", "sessions", "all", page, limit] as const,
};

export function useAccount() {
  return useQuery({ queryKey: accountKeys.me, queryFn: getAccount });
}

export function useActiveSessions(enabled = true) {
  return useQuery({ queryKey: accountKeys.activeSessions, queryFn: listActiveSessions, enabled });
}

export function useAllSessions(page: number, limit: number, enabled = true) {
  return useQuery({
    queryKey: accountKeys.allSessions(page, limit),
    queryFn: () => listAllSessions(page, limit),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSignOutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: signOutSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.sessions });
      toast.success("Device signed out");
    },
    onError: (err) => {
      qc.invalidateQueries({ queryKey: accountKeys.sessions });
      toast.error(getErrorMessage(err));
    },
  });
}

export function useSignOutOtherSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: signOutOtherSessions,
    onSuccess: ({ signed_out }) => {
      qc.invalidateQueries({ queryKey: accountKeys.sessions });
      toast.success(
        signed_out === 0 ? "No other devices were signed in" : `Signed out ${signed_out} other device${signed_out === 1 ? "" : "s"}`,
      );
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useChangePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: ({ signed_out }) => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
      toast.success(
        signed_out > 0
          ? `Password changed. ${signed_out} other device${signed_out === 1 ? " was" : "s were"} signed out.`
          : "Password changed",
      );
    },
    // Errors are shown inline on the form.
  });
}
