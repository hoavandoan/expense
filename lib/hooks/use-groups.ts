import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as groupsService from "../services/groups-service";
import { useAuth } from '@/contexts/auth-context';
import type { Group, GroupType, GroupWithDetails } from "../types";
import { generateInviteCode } from "../utils/format";
import { recentExpensesQueryOptions } from "./use-expenses";

export const groupsQueryOptions = queryOptions({
  queryKey: ["groups"],
  queryFn: () => groupsService.fetchGroups(),
});

export const groupQueryOptions = (groupId: string | null) => queryOptions({
  queryKey: ["group", groupId],
  queryFn: () => groupsService.fetchGroup(groupId!),
  enabled: !!groupId,
});

/**
 * Fetch all groups for the current user
 */
export const useGroups = () => {
  const { session } = useAuth();
  return useQuery({
    ...groupsQueryOptions,
    enabled: !!session,
  });
};

/**
 * Fetch a single group with full details
 */
export const useGroup = (groupId: string | null) => {
  const { session } = useAuth();
  return useQuery({
    ...groupQueryOptions(groupId),
    enabled: !!session && !!groupId,
  });
};

/**
 * Create a new group
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-group'],
    mutationFn: async (input: {
      name: string;
      description?: string;
      coverImageUrl?: string;
      currency?: string;
      groupType?: string;
    }) => {
      const inviteCode = generateInviteCode();

      return groupsService.createGroup({ ...input, inviteCode });
    },
    onMutate: async (newGroupInput) => {
      const queryKey = groupsQueryOptions.queryKey;
      await queryClient.cancelQueries({ queryKey });

      const previousGroups = queryClient.getQueryData<Group[]>(queryKey);

      const optimisticGroup: Group = {
        id: Date.now().toString(),
        name: newGroupInput.name,
        description: newGroupInput.description || null,
        coverImageUrl: newGroupInput.coverImageUrl || null,
        inviteCode: '......', // Server will generate
        currency: newGroupInput.currency || 'USD',
        groupType: (newGroupInput.groupType as GroupType) || 'other',
        createdBy: '', // Will be filled by server
        createdAt: new Date().toISOString(),
        hasDebtAssignment: false,
        debtAssignmentEnabled: false,
      };

      queryClient.setQueryData<Group[]>(queryKey, (old) => [...(old || []), optimisticGroup]);

      return { previousGroups };
    },
    onError: (err, variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(groupsQueryOptions.queryKey, context.previousGroups);
      }
    },
    onSettled: () => {
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
    mutationKey: ['join-group'],
    mutationFn: async (inviteCodeOrId: string) => {
      return groupsService.joinGroup(inviteCodeOrId);
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
    mutationKey: ['leave-group'],
    mutationFn: async (groupId: string) => {
      return groupsService.leaveGroup(groupId);
    },
    onMutate: async (groupId) => {
      const queryKey = groupsQueryOptions.queryKey;
      await queryClient.cancelQueries({ queryKey });

      const previousGroups = queryClient.getQueryData<Group[]>(queryKey);

      queryClient.setQueryData<Group[]>(queryKey, (old) =>
        old?.filter((g) => g.id !== groupId)
      );

      return { previousGroups };
    },
    onError: (err, groupId, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(groupsQueryOptions.queryKey, context.previousGroups);
      }
    },
    onSettled: () => {
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
    mutationKey: ['update-group'],
    mutationFn: async ({
      groupId,
      ...updates
    }: {
      groupId: string;
      name?: string;
      description?: string;
    }) => {
      return groupsService.updateGroup(groupId, updates);
    },
    onMutate: async ({ groupId, ...updates }) => {
      const listKey = groupsQueryOptions.queryKey;
      const detailKey = groupQueryOptions(groupId).queryKey;

      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousGroups = queryClient.getQueryData<Group[]>(listKey);
      const previousDetail = queryClient.getQueryData<GroupWithDetails>(detailKey);

      // Update list
      queryClient.setQueryData<Group[]>(listKey, (old) =>
        old?.map((g) => g.id === groupId ? { ...g, ...updates } : g)
      );

      // Update detail
      if (previousDetail) {
        queryClient.setQueryData<GroupWithDetails>(detailKey, {
          ...previousDetail,
          ...updates,
        });
      }

      return { previousGroups, previousDetail };
    },
    onError: (err, { groupId }, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(groupsQueryOptions.queryKey, context.previousGroups);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(groupQueryOptions(groupId).queryKey, context.previousDetail);
      }
    },
    onSettled: (_, __, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
    },
  });
};

/**
 * Remove a member from a group (owner/admin only)
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['remove-member'],
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      return groupsService.removeMember(groupId, userId);
    },
    onMutate: async ({ groupId, userId }) => {
      const detailKey = groupQueryOptions(groupId).queryKey;
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<GroupWithDetails>(detailKey);

      if (previousDetail) {
        const detail = previousDetail as any;
        queryClient.setQueryData(detailKey, {
          ...detail,
          group_members: detail.group_members?.filter(
            (m: any) => m.user_id !== userId
          ),
        });
      }

      return { previousDetail };
    },
    onError: (err, { groupId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(groupQueryOptions(groupId).queryKey, context.previousDetail);
      }
    },
    onSettled: (_, __, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
    },
  });
};
