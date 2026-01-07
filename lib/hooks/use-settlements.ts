import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Settlement } from '../types';

/**
 * Fetch settlements for a group
 */
export const useSettlements = (groupId: string | null) => {
    return useQuery({
        queryKey: ['settlements', groupId],
        queryFn: async () => {
            if (!groupId) return [];

            const { data, error } = await supabase
                .from('settlements')
                .select(`
          *,
          from_user:users!settlements_from_user_id_fkey(id, name, avatar_url),
          to_user:users!settlements_to_user_id_fkey(id, name, avatar_url)
        `)
                .eq('group_id', groupId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Settlement[];
        },
        enabled: !!groupId,
    });
};

/**
 * Fetch pending settlements where current user is the receiver
 */
export const usePendingSettlements = (groupId: string | null) => {
    return useQuery({
        queryKey: ['pending-settlements', groupId],
        queryFn: async () => {
            if (!groupId) return [];

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('settlements')
                .select(`
          *,
          from_user:users!settlements_from_user_id_fkey(id, name, avatar_url),
          to_user:users!settlements_to_user_id_fkey(id, name, avatar_url)
        `)
                .eq('group_id', groupId)
                .eq('to_user_id', user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Settlement[];
        },
        enabled: !!groupId,
    });
};

/**
 * Create a settlement request
 */
export const useCreateSettlement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            groupId: string;
            toUserId: string;
            amount: number;
            note?: string;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('settlements')
                .insert({
                    group_id: input.groupId,
                    from_user_id: user.id,
                    to_user_id: input.toUserId,
                    amount: input.amount,
                    note: input.note || null,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;
            return data as Settlement;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
        },
    });
};

/**
 * Complete a settlement (mark as paid)
 */
export const useCompleteSettlement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ settlementId, groupId }: { settlementId: string; groupId: string }) => {
            const { data, error } = await supabase
                .from('settlements')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', settlementId)
                .select()
                .single();

            if (error) throw error;
            return data as Settlement;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
        },
    });
};

/**
 * Reject a settlement
 */
export const useRejectSettlement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ settlementId, groupId }: { settlementId: string; groupId: string }) => {
            const { data, error } = await supabase
                .from('settlements')
                .update({ status: 'rejected' })
                .eq('id', settlementId)
                .select()
                .single();

            if (error) throw error;
            return data as Settlement;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
        },
    });
};
