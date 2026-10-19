import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/types/api";
import { analyticsKeys } from "@/features/analytics/hooks/use-analytics";
import { formatDateTime } from "@/features/analytics/utils/format";
import {
  getUser,
  listUsers,
  retryCheckin,
  type ListUsersParams,
} from "@/features/users/services/users.service";

export const userKeys = {
  all: ["users"] as const,
  list: (params: ListUsersParams) => ["users", "list", params] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
  });
}

// The request waits for the model call, so it can take ~15s.
export function useRetryCheckin(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checkinId: string) => retryCheckin(checkinId),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
      if (result.status === "ready") {
        toast.success("Check-in generated");
      } else if (result.status === "failed") {
        toast.error(
          result.next_retry_at
            ? `Failed again. Next automatic retry ${formatDateTime(result.next_retry_at)}`
            : "Failed again",
        );
      } else {
        toast.info(`Check-in is now ${result.status}`);
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
