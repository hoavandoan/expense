import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as settlementsService from '../services/settlements-service';
import { useAuth } from '@/contexts/auth-context';
import type { Settlement } from '../types';
import { groupQueryOptions } from './use-groups';

export const settlementsQueryOptions = (groupId: string | null) => queryOptions({
    queryKey: ['settlements', groupId],
    queryFn: () => settlementsService.fetchSettlements(groupId!),
    enabled: !!groupId,
});

export const pendingSettlementsQueryOptions = (groupId: string | null) => queryOptions({
    queryKey: ['pending-settlements', groupId],
    queryFn: () => settlementsService.fetchPendingSettlements(groupId!),
    enabled: !!groupId,
});

/**
 * Fetch settlements for a group
 */
export const useSettlements = (groupId: string | null) => {
    const { session } = useAuth();
    return useQuery({
        ...settlementsQueryOptions(groupId),
        enabled: !!session && !!groupId,
    });
};

/**
 * Fetch pending settlements where current user is the receiver
 */
export const usePendingSettlements = (groupId: string | null) => {
    const { session } = useAuth();
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
        }) => settlementsService.createSettlement(input),
        onMutate: async (newSettlementInput) => {
            const { groupId } = newSettlementInput;
            const queryKey = settlementsQueryOptions(groupId).queryKey;
            const pendingQueryKey = pendingSettlementsQueryOptions(groupId).queryKey;

            await queryClient.cancelQueries({ queryKey });
            await queryClient.cancelQueries({ queryKey: pendingQueryKey });

            const previousSettlements = queryClient.getQueryData<Settlement[]>(queryKey);
            const previousPending = queryClient.getQueryData<Settlement[]>(pendingQueryKey);

            const optimisticSettlement: Settlement = {
                id: Date.now().toString(),
                groupId: groupId,
                fromUserId: '', // Will be filled by server, but we can assume current user if needed
                toUserId: newSettlementInput.toUserId,
                amount: newSettlementInput.amount,
                status: 'pending',
                createdAt: new Date().toISOString(),
                completedAt: null,
            };

            queryClient.setQueryData<Settlement[]>(queryKey, (old) => [optimisticSettlement, ...(old || [])]);
            queryClient.setQueryData<Settlement[]>(pendingQueryKey, (old) => [optimisticSettlement, ...(old || [])]);

            return { previousSettlements, previousPending };
        },
        onError: (err, variables, context) => {
            if (context?.previousSettlements) {
                queryClient.setQueryData(settlementsQueryOptions(variables.groupId).queryKey, context.previousSettlements);
            }
            if (context?.previousPending) {
                queryClient.setQueryData(pendingSettlementsQueryOptions(variables.groupId).queryKey, context.previousPending);
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: settlementsQueryOptions(variables.groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: pendingSettlementsQueryOptions(variables.groupId).queryKey });
        },
    });
};

/**
 * Complete a settlement (mark as paid)
 */
export const useCompleteSettlement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ settlementId, groupId }: { settlementId: string; groupId: string }) =>
            settlementsService.updateSettlementStatus(settlementId, 'completed'),
        onMutate: async ({ settlementId, groupId }) => {
            const queryKey = settlementsQueryOptions(groupId).queryKey;
            const pendingQueryKey = pendingSettlementsQueryOptions(groupId).queryKey;

            await queryClient.cancelQueries({ queryKey });
            await queryClient.cancelQueries({ queryKey: pendingQueryKey });

            const previousSettlements = queryClient.getQueryData<Settlement[]>(queryKey);
            const previousPending = queryClient.getQueryData<Settlement[]>(pendingQueryKey);

            const updater = (old: Settlement[] | undefined) =>
                old?.map((s) => s.id === settlementId ? { ...s, status: 'completed' as const, completedAt: new Date().toISOString() } : s);

            queryClient.setQueryData<Settlement[]>(queryKey, updater);
            queryClient.setQueryData<Settlement[]>(pendingQueryKey, (old) => old?.filter(s => s.id !== settlementId));

            return { previousSettlements, previousPending };
        },
        onError: (err, { groupId }, context) => {
            if (context?.previousSettlements) {
                queryClient.setQueryData(settlementsQueryOptions(groupId).queryKey, context.previousSettlements);
            }
            if (context?.previousPending) {
                queryClient.setQueryData(pendingSettlementsQueryOptions(groupId).queryKey, context.previousPending);
            }
        },
        onSettled: (_, __, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: settlementsQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: pendingSettlementsQueryOptions(groupId).queryKey });
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
        mutationFn: ({ settlementId, groupId }: { settlementId: string; groupId: string }) =>
            settlementsService.updateSettlementStatus(settlementId, 'rejected'),
        onMutate: async ({ settlementId, groupId }) => {
            const queryKey = settlementsQueryOptions(groupId).queryKey;
            const pendingQueryKey = pendingSettlementsQueryOptions(groupId).queryKey;

            await queryClient.cancelQueries({ queryKey });
            await queryClient.cancelQueries({ queryKey: pendingQueryKey });

            const previousSettlements = queryClient.getQueryData<Settlement[]>(queryKey);
            const previousPending = queryClient.getQueryData<Settlement[]>(pendingQueryKey);

            const updater = (old: Settlement[] | undefined) =>
                old?.map((s) => s.id === settlementId ? { ...s, status: 'rejected' as const } : s);

            queryClient.setQueryData<Settlement[]>(queryKey, updater);
            queryClient.setQueryData<Settlement[]>(pendingQueryKey, (old) => old?.filter(s => s.id !== settlementId));

            return { previousSettlements, previousPending };
        },
        onError: (err, { groupId }, context) => {
            if (context?.previousSettlements) {
                queryClient.setQueryData(settlementsQueryOptions(groupId).queryKey, context.previousSettlements);
            }
            if (context?.previousPending) {
                queryClient.setQueryData(pendingSettlementsQueryOptions(groupId).queryKey, context.previousPending);
            }
        },
        onSettled: (_, __, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: settlementsQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: pendingSettlementsQueryOptions(groupId).queryKey });
        },
    });
};
