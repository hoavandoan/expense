import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as debtAssignmentsService from '../services/debt-assignments-service';
import type { DebtAssignment } from '../types';
import { groupActivityQueryOptions } from './use-activity';
import { groupQueryOptions } from './use-groups';

export const debtAssignmentQueryOptions = (groupId: string | null) => queryOptions({
    queryKey: ['debt-assignment', groupId],
    queryFn: () => debtAssignmentsService.fetchActiveDebtAssignment(groupId!),
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
        }) => debtAssignmentsService.createDebtAssignment(input),
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
        mutationFn: (groupId: string) => debtAssignmentsService.disableDebtAssignment(groupId),
        onSuccess: (_, groupId) => {
            queryClient.invalidateQueries({ queryKey: debtAssignmentQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
            queryClient.invalidateQueries({ queryKey: groupActivityQueryOptions(groupId).queryKey });
        },
    });
};
