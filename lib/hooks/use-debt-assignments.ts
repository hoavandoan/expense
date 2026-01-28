import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { DebtAssignment } from '../types';
import { groupActivityQueryOptions } from './use-activity';
import { groupQueryOptions } from './use-groups';

export const debtAssignmentQueryOptions = (groupId: string | null) => queryOptions({
    queryKey: ['debt-assignment', groupId],
    queryFn: () => apiClient<DebtAssignment | null>(`/debt-assignments?groupId=${groupId}`),
    enabled: !!groupId,
});

export const useDebtAssignment = (groupId: string | null) => {
    return useQuery(debtAssignmentQueryOptions(groupId));
};

export const useSetDebtAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: {
            groupId: string;
            assigneeUserId: string;
            reason?: string;
        }) => apiClient<DebtAssignment>('/debt-assignments', {
            method: 'POST',
            body: JSON.stringify(input),
        }),
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: debtAssignmentQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupActivityQueryOptions(groupId).queryKey });
        },
    });
};

export const useDisableDebtAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (groupId: string) => apiClient('/debt-assignments', {
            method: 'POST',
            body: JSON.stringify({ groupId, action: 'disable' }),
        }),
        onSuccess: (_, groupId) => {
            queryClient.invalidateQueries({ queryKey: debtAssignmentQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupActivityQueryOptions(groupId).queryKey });
        },
    });
};

