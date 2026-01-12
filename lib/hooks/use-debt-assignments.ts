import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { DebtAssignment } from '../types';

export const useDebtAssignment = (groupId: string | null) => {
    return useQuery({
        queryKey: ['debt-assignment', groupId],
        queryFn: async () => {
            if (!groupId) return null;

            const { data, error } = await supabase
                .from('debt_assignments')
                .select(`
          *,
          assignee_user:users!debt_assignments_assignee_user_id_fkey(id, name, avatar_url),
          assigned_by_user:users!debt_assignments_assigned_by_user_id_fkey(id, name, avatar_url)
        `)
                .eq('group_id', groupId)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned"
                throw error;
            }

            return data as DebtAssignment | null;
        },
        enabled: !!groupId,
    });
};

export const useSetDebtAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            groupId: string;
            assigneeUserId: string;
            reason?: string;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Deactivate any existing active assignment
            await supabase
                .from('debt_assignments')
                .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
                .eq('group_id', input.groupId)
                .eq('status', 'active');

            // 2. Create new assignment
            const { data, error } = await supabase
                .from('debt_assignments')
                .insert({
                    group_id: input.groupId,
                    assignee_user_id: input.assigneeUserId,
                    assigned_by_user_id: user.id,
                    reason: input.reason,
                    status: 'active',
                })
                .select()
                .single();

            if (error) throw error;

            // 3. Update group flag if needed
            await supabase
                .from('groups')
                .update({ has_debt_assignment: true })
                .eq('id', input.groupId);

            return data as DebtAssignment;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['debt-assignment', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['activity-logs', groupId] });
        },
    });
};

export const useDisableDebtAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (groupId: string) => {
            const { error } = await supabase
                .from('debt_assignments')
                .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
                .eq('group_id', groupId)
                .eq('status', 'active');

            if (error) throw error;

            // Update group flag
            await supabase
                .from('groups')
                .update({ has_debt_assignment: false })
                .eq('id', groupId);
        },
        onSuccess: (_, groupId) => {
            queryClient.invalidateQueries({ queryKey: ['debt-assignment', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['activity-logs', groupId] });
        },
    });
};
