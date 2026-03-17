import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as debtAssignmentRequestsService from '../services/debt-assignment-requests-service';
import type { DebtAssignmentRequest } from '../types';
import { groupActivityQueryOptions } from './use-activity';
import { debtAssignmentQueryOptions } from './use-debt-assignments';
import { groupQueryOptions } from './use-groups';

export const pendingAssignmentRequestsQueryOptions = (groupId: string | null) => queryOptions({
    queryKey: ['debt-assignment-requests', groupId],
    queryFn: () => debtAssignmentRequestsService.fetchPendingRequests(groupId!),
    enabled: !!groupId,
});

export const usePendingAssignmentRequests = (groupId: string | null) => {
    return useQuery(pendingAssignmentRequestsQueryOptions(groupId));
};

export const useCreateAssignmentRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['create-assignment-request'],
        mutationFn: (input: {
            groupId: string;
            proposedAssigneeUserId: string;
            reason?: string;
        }) => debtAssignmentRequestsService.createRequest(input),
        onMutate: async (newRequest) => {
            const queryKey = pendingAssignmentRequestsQueryOptions(newRequest.groupId).queryKey;
            await queryClient.cancelQueries({ queryKey });

            const previousRequests = queryClient.getQueryData<DebtAssignmentRequest[]>(queryKey);

            const optimisticRequest: DebtAssignmentRequest = {
                id: Date.now().toString(),
                groupId: newRequest.groupId,
                requestedByUserId: '',
                proposedAssigneeUserId: newRequest.proposedAssigneeUserId,
                reason: newRequest.reason,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
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
        mutationKey: ['approve-assignment-request'],
        mutationFn: (input: {
            requestId: string;
            groupId: string;
            proposedAssigneeUserId: string;
            reason?: string;
        }) => debtAssignmentRequestsService.approveRequest(input),
        onMutate: async ({ requestId, groupId }) => {
            const queryKey = pendingAssignmentRequestsQueryOptions(groupId).queryKey;
            await queryClient.cancelQueries({ queryKey });

            const previousRequests = queryClient.getQueryData<DebtAssignmentRequest[]>(queryKey);

            queryClient.setQueryData<DebtAssignmentRequest[]>(queryKey, (old) =>
                old?.map((r) => r.id === requestId ? { ...r, status: 'approved' as const, reviewedAt: new Date().toISOString() } : r)
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
        mutationKey: ['reject-assignment-request'],
        mutationFn: (input: {
            requestId: string;
            groupId: string;
            reviewNotes?: string;
        }) => debtAssignmentRequestsService.rejectRequest(input),
        onMutate: async ({ requestId, groupId }) => {
            const queryKey = pendingAssignmentRequestsQueryOptions(groupId).queryKey;
            await queryClient.cancelQueries({ queryKey });

            const previousRequests = queryClient.getQueryData<DebtAssignmentRequest[]>(queryKey);

            queryClient.setQueryData<DebtAssignmentRequest[]>(queryKey, (old) =>
                old?.map((r) => r.id === requestId ? { ...r, status: 'rejected' as const, reviewedAt: new Date().toISOString() } : r)
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
