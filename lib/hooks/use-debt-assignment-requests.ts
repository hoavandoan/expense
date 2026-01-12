import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { DebtAssignmentRequest } from '../types';

export const usePendingAssignmentRequests = (groupId: string | null) => {
    return useQuery({
        queryKey: ['debt-assignment-requests', groupId],
        queryFn: async () => {
            if (!groupId) return [];

            const { data, error } = await supabase
                .from('debt_assignment_requests')
                .select(`
          *,
          requested_by_user:users!debt_assignment_requests_requested_by_user_id_fkey(id, name, avatar_url),
          proposed_assignee_user:users!debt_assignment_requests_proposed_assignee_user_id_fkey(id, name, avatar_url)
        `)
                .eq('group_id', groupId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as DebtAssignmentRequest[];
        },
        enabled: !!groupId,
    });
};

export const useCreateAssignmentRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            groupId: string;
            proposedAssigneeUserId: string;
            reason?: string;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('debt_assignment_requests')
                .insert({
                    group_id: input.groupId,
                    requested_by_user_id: user.id,
                    proposed_assignee_user_id: input.proposedAssigneeUserId,
                    reason: input.reason,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;
            return data as DebtAssignmentRequest;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['debt-assignment-requests', groupId] });
            queryClient.invalidateQueries({ queryKey: ['activity-logs', groupId] });
        },
    });
};

export const useApproveAssignmentRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            requestId: string;
            groupId: string;
            proposedAssigneeUserId: string;
            reason?: string;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Deactivate existing assignment
            await supabase
                .from('debt_assignments')
                .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
                .eq('group_id', input.groupId)
                .eq('status', 'active');

            // 2. Create new assignment
            const { error: assignmentError } = await supabase
                .from('debt_assignments')
                .insert({
                    group_id: input.groupId,
                    assignee_user_id: input.proposedAssigneeUserId,
                    assigned_by_user_id: user.id,
                    reason: input.reason,
                    status: 'active',
                });

            if (assignmentError) throw assignmentError;

            // 3. Update request status
            const { data, error: requestError } = await supabase
                .from('debt_assignment_requests')
                .update({
                    status: 'approved',
                    reviewed_by_user_id: user.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', input.requestId)
                .select()
                .single();

            if (requestError) throw requestError;

            // 4. Update group flag
            await supabase
                .from('groups')
                .update({ has_debt_assignment: true })
                .eq('id', input.groupId);

            return data as DebtAssignmentRequest;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['debt-assignment-requests', groupId] });
            queryClient.invalidateQueries({ queryKey: ['debt-assignment', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['activity-logs', groupId] });
        },
    });
};

export const useRejectAssignmentRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            requestId: string;
            groupId: string;
            reviewNotes?: string;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('debt_assignment_requests')
                .update({
                    status: 'rejected',
                    reviewed_by_user_id: user.id,
                    reviewed_at: new Date().toISOString(),
                    review_notes: input.reviewNotes,
                })
                .eq('id', input.requestId)
                .select()
                .single();

            if (error) throw error;
            return data as DebtAssignmentRequest;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['debt-assignment-requests', groupId] });
            queryClient.invalidateQueries({ queryKey: ['activity-logs', groupId] });
        },
    });
};
