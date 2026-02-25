import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { DebtAssignmentRequest } from '../types';
import { groupActivityQueryOptions } from './use-activity';
import { debtAssignmentQueryOptions } from './use-debt-assignments';
import { groupQueryOptions } from './use-groups';

export const pendingAssignmentRequestsQueryOptions = (groupId: string | null) => queryOptions({
    queryKey: ['debt-assignment-requests', groupId],
    queryFn: () => apiClient<DebtAssignmentRequest[]>(`/debt-assignment-requests?groupId=${groupId}`),
    enabled: !!groupId,
});

export const usePendingAssignmentRequests = (groupId: string | null) => {
    return useQuery(pendingAssignmentRequestsQueryOptions(groupId));
};

export const useCreateAssignmentRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: {
            groupId: string;
            proposedAssigneeUserId: string;
            reason?: string;
        }) => apiClient<DebtAssignmentRequest>('/debt-assignment-requests', {
            method: 'POST',
            body: JSON.stringify(input),
        }),
        onMutate: async (newRequest) => {
            const queryKey = pendingAssignmentRequestsQueryOptions(newRequest.groupId).queryKey;
            await queryClient.cancelQueries({ queryKey });

            const previousRequests = queryClient.getQueryData<DebtAssignmentRequest[]>(queryKey);

            const optimisticRequest: DebtAssignmentRequest = {
                id: Date.now().toString(),
                groupId: newRequest.groupId,
                fromUserId: '', // Current user, filled by server
                toUserId: newRequest.proposedAssigneeUserId,
                amount: 0, // This logic seems to be about assignment rather than debt amount in this specific hook
                reason: (newRequest.reason ?? null) as string | null,
                status: 'pending',
                createdAt: new Date().toISOString(),
                respondedAt: null,
            };

            queryClient.setQueryData<DebtAssignmentRequest[]>(queryKey, (old) => [optimisticRequest, ...(old || [])]);

            return { previousRequests };
        },
        onError: (err, variables, context) => {
            if (context?.previousRequests) {
                queryClient.setQueryData(pendingAssignmentRequestsQueryOptions(variables.groupId).queryKey, context.previousRequests);
            }
        },
        onSettled: (_, __, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: pendingAssignmentRequestsQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupActivityQueryOptions(groupId).queryKey });
        },
    });
};

export const useApproveAssignmentRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: {
            requestId: string;
            groupId: string;
            proposedAssigneeUserId: string;
            reason?: string;
        }) => apiClient<DebtAssignmentRequest>('/debt-assignment-requests', {
            method: 'PATCH',
            body: JSON.stringify({ ...input, status: 'approved' }),
        }),
        onMutate: async ({ requestId, groupId }) => {
            const queryKey = pendingAssignmentRequestsQueryOptions(groupId).queryKey;
            await queryClient.cancelQueries({ queryKey });

            const previousRequests = queryClient.getQueryData<DebtAssignmentRequest[]>(queryKey);

            queryClient.setQueryData<DebtAssignmentRequest[]>(queryKey, (old) =>
                old?.map((r) => r.id === requestId ? { ...r, status: 'approved' as const, respondedAt: new Date().toISOString() } : r)
            );

            return { previousRequests };
        },
        onError: (err, { groupId }, context) => {
            if (context?.previousRequests) {
                queryClient.setQueryData(pendingAssignmentRequestsQueryOptions(groupId).queryKey, context.previousRequests);
            }
        },
        onSettled: (_, __, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: pendingAssignmentRequestsQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: debtAssignmentQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupActivityQueryOptions(groupId).queryKey });
        },
    });
};

export const useRejectAssignmentRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: {
            requestId: string;
            groupId: string;
            reviewNotes?: string;
        }) => apiClient<DebtAssignmentRequest>('/debt-assignment-requests', {
            method: 'PATCH',
            body: JSON.stringify({ ...input, status: 'rejected' }),
        }),
        onMutate: async ({ requestId, groupId }) => {
            const queryKey = pendingAssignmentRequestsQueryOptions(groupId).queryKey;
            await queryClient.cancelQueries({ queryKey });

            const previousRequests = queryClient.getQueryData<DebtAssignmentRequest[]>(queryKey);

            queryClient.setQueryData<DebtAssignmentRequest[]>(queryKey, (old) =>
                old?.map((r) => r.id === requestId ? { ...r, status: 'rejected' as const, respondedAt: new Date().toISOString() } : r)
            );

            return { previousRequests };
        },
        onError: (err, { groupId }, context) => {
            if (context?.previousRequests) {
                queryClient.setQueryData(pendingAssignmentRequestsQueryOptions(groupId).queryKey, context.previousRequests);
            }
        },
        onSettled: (_, __, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: pendingAssignmentRequestsQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupActivityQueryOptions(groupId).queryKey });
        },
    });
};

