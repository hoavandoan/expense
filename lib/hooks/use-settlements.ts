import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { useAuthStore } from '../stores/auth-store';
import type { Settlement } from '../types';
import { groupQueryOptions } from './use-groups';

export const settlementsQueryOptions = (groupId: string | null) => queryOptions({
    queryKey: ['settlements', groupId],
    queryFn: () => apiClient<Settlement[]>(`/settlements?groupId=${groupId}`),
    enabled: !!groupId,
});

export const pendingSettlementsQueryOptions = (groupId: string | null) => queryOptions({
    queryKey: ['pending-settlements', groupId],
    queryFn: () => apiClient<Settlement[]>(`/settlements?groupId=${groupId}&pendingOnly=true`),
    enabled: !!groupId,
});

/**
 * Fetch settlements for a group
 */
export const useSettlements = (groupId: string | null) => {
    const session = useAuthStore((state) => state.session);
    return useQuery({
        ...settlementsQueryOptions(groupId),
        enabled: !!session && !!groupId,
    });
};

/**
 * Fetch pending settlements where current user is the receiver
 */
export const usePendingSettlements = (groupId: string | null) => {
    const session = useAuthStore((state) => state.session);
    return useQuery({
        ...pendingSettlementsQueryOptions(groupId),
        enabled: !!session && !!groupId,
    });
};

/**
 * Create a settlement request
 */
export const useCreateSettlement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: {
            groupId: string;
            toUserId: string;
            amount: number;
            note?: string;
        }) => apiClient<Settlement>('/settlements', {
            method: 'POST',
            body: JSON.stringify(input),
        }),
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: settlementsQueryOptions(groupId).queryKey });
        },
    });
};

/**
 * Complete a settlement (mark as paid)
 */
export const useCompleteSettlement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ settlementId, groupId }: { settlementId: string; groupId: string }) => apiClient<Settlement>('/settlements', {
            method: "PATCH",
            body: JSON.stringify({ settlementId, status: "completed" }),
        }),
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: settlementsQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
        },
    });
};

/**
 * Reject a settlement
 */
export const useRejectSettlement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ settlementId, groupId }: { settlementId: string; groupId: string }) => apiClient<Settlement>('/settlements', {
            method: "PATCH",
            body: JSON.stringify({ settlementId, status: "rejected" }),
        }),
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: settlementsQueryOptions(groupId).queryKey });
        },
    });
};

