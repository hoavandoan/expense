import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import type { Group, GroupWithDetails } from "../types";
import { generateInviteCode } from "../utils/format";
import { recentExpensesQueryOptions } from "./use-expenses";

export const groupsQueryOptions = queryOptions({
  queryKey: ["groups"],
  queryFn: () => apiClient<Group[]>("/groups"),
});

export const groupQueryOptions = (groupId: string | null) => queryOptions({
  queryKey: ["group", groupId],
  queryFn: () => apiClient<GroupWithDetails>(`/groups/${groupId}`),
  enabled: !!groupId,
});

/**
 * Fetch all groups for the current user
 */
export const useGroups = () => {
  return useQuery(groupsQueryOptions);
};

/**
 * Fetch a single group with full details
 */
export const useGroup = (groupId: string | null) => {
  return useQuery(groupQueryOptions(groupId));
};

/**
 * Create a new group
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      coverImageUrl?: string;
      currency?: string;
      groupType?: string;
    }) => {
      // Invite code generation remains on client for now or can be moved to server
      // The implementation plan had it as a separate task but let's just generate it here
      const inviteCode = generateInviteCode();

      return apiClient<Group>("/groups", {
        method: "POST",
        body: JSON.stringify({ ...input, inviteCode }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
    },
  });
};

/**
 * Join a group using invite code or group ID
 */
export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCodeOrId: string) => {
      // Join logic might require a specific endpoint or be part of groups POST
      // For now, let's assume we have a join endpoint or just use the existing logic if it was simple
      // But actually, joining is better as a separate POST /api/groups/join
      return apiClient<string>("/groups/join", {
        method: "POST",
        body: JSON.stringify({ inviteCodeOrId }),
      });
    },
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: recentExpensesQueryOptions().queryKey });
    },
  });
};

/**
 * Leave a group
 */
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      return apiClient(`/groups/${groupId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
    },
  });
};

/**
 * Update group details
 */
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      ...updates
    }: {
      groupId: string;
      name?: string;
      description?: string;
    }) => {
      return apiClient<Group>(`/groups/${groupId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
    },
  });
};

