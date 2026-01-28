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
        onSuccess: (_, { groupId }) => {
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
        onSuccess: (_, { groupId }) => {
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
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: pendingAssignmentRequestsQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupActivityQueryOptions(groupId).queryKey });
        },
    });
};

