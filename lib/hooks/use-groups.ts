import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Group, GroupWithDetails } from '../types';

const GROUPS_KEY = ['groups'];

/**
 * Fetch all groups for the current user
 */
export const useGroups = () => {
    return useQuery({
        queryKey: GROUPS_KEY,
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('groups')
                .select(`
          *,
          group_members!inner(user_id, role),
          expenses(amount)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform to include computed fields
            return (data || []).map((group) => ({
                ...group,
                memberCount: group.group_members?.length || 0,
                totalExpenses: group.expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0,
            }));
        },
    });
};

/**
 * Fetch a single group with full details
 */
export const useGroup = (groupId: string | null) => {
    return useQuery({
        queryKey: ['group', groupId],
        queryFn: async () => {
            if (!groupId) return null;

            const { data, error } = await supabase
                .from('groups')
                .select(`
          *,
          group_members(
            id, user_id, role, joined_at,
            user:users(id, name, email, avatar_url)
          ),
          expenses(
            id, title, description, amount, category, paid_by, expense_date, created_at,
            paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
            expense_splits(id, user_id, amount, is_paid)
          )
        `)
                .eq('id', groupId)
                .single();

            if (error) throw error;
            return data as GroupWithDetails;
        },
        enabled: !!groupId,
    });
};

/**
 * Create a new group
 */
export const useCreateGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            name: string;
            description?: string;
            coverImageUrl?: string;
            currency?: string;
            groupType?: string;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('groups')
                .insert({
                    name: input.name,
                    description: input.description || null,
                    cover_image_url: input.coverImageUrl || null,
                    currency: input.currency || 'VND',
                    group_type: input.groupType || 'trip',
                    created_by: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data as Group;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
        },
    });
};

/**
 * Join a group using invite code
 */
export const useJoinGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (inviteCode: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Find group by invite code
            const { data: group, error: findError } = await supabase
                .from('groups')
                .select('id')
                .eq('invite_code', inviteCode.toUpperCase())
                .single();

            if (findError || !group) throw new Error('Invalid invite code');

            // Check if already a member
            const { data: existing } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', group.id)
                .eq('user_id', user.id)
                .single();

            if (existing) throw new Error('Already a member of this group');

            // Add user to group
            const { error: joinError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'member',
                });

            if (joinError) throw joinError;
            return group.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
        },
    });
};

/**
 * Leave a group
 */
export const useLeaveGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (groupId: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
        },
    });
};

/**
 * Update group details
 */
export const useUpdateGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ groupId, ...updates }: { groupId: string; name?: string; description?: string }) => {
            const { data, error } = await supabase
                .from('groups')
                .update(updates)
                .eq('id', groupId)
                .select()
                .single();

            if (error) throw error;
            return data as Group;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
        },
    });
};
