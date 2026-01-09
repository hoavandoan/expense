import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Group, GroupWithDetails } from '../types';
import { generateInviteCode } from '../utils/format';

const GROUPS_KEY = ['groups'];
const GROUP_KEY = (groupId: string) => ['group', groupId];

/**
 * Generate a unique invite code (checks database for uniqueness)
 */
const generateUniqueInviteCode = async (): Promise<string> => {
    const MAX_ATTEMPTS = 10;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const code = generateInviteCode();

        // Check if code already exists
        const { data: existing } = await supabase
            .from('groups')
            .select('id')
            .eq('invite_code', code)
            .single();

        if (!existing) {
            return code;
        }
    }

    throw new Error('Không thể tạo mã mời. Vui lòng thử lại.');
};

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

            // Generate a unique invite code
            const inviteCode = await generateUniqueInviteCode();

            const { data, error } = await supabase
                .from('groups')
                .insert({
                    name: input.name,
                    description: input.description || null,
                    cover_image_url: input.coverImageUrl || null,
                    currency: input.currency || 'VND',
                    group_type: input.groupType || 'trip',
                    created_by: user.id,
                    invite_code: inviteCode,
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
 * Join a group using invite code or group ID
 */
export const useJoinGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (inviteCodeOrId: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const code = inviteCodeOrId.trim().toUpperCase();
            let groupId: string | null = null;

            // Check if input looks like a UUID (group ID)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inviteCodeOrId.trim());

            if (isUUID) {
                // Direct group ID lookup
                const { data: group, error } = await supabase
                    .from('groups')
                    .select('id')
                    .eq('id', inviteCodeOrId.trim())
                    .single();

                if (!error && group) {
                    groupId = group.id;
                }
            }

            // If not found by ID, try invite code
            if (!groupId) {
                console.log('Searching for invite_code:', code);

                const { data: group, error } = await supabase
                    .from('groups')
                    .select('id, invite_code')
                    .eq('invite_code', code)
                    .maybeSingle();

                console.log('Query result - group:', group, 'error:', error);

                if (error) {
                    console.error('Error finding group by invite_code:', error);
                }

                if (group) {
                    groupId = group.id;
                }
            }

            if (!groupId) {
                throw new Error('Mã mời không hợp lệ hoặc nhóm không tồn tại');
            }

            // Check if already a member
            const { data: existing } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('user_id', user.id)
                .single();

            if (existing) throw new Error('Bạn đã là thành viên của nhóm này');

            // Add user to group
            const { error: joinError } = await supabase
                .from('group_members')
                .insert({
                    group_id: groupId,
                    user_id: user.id,
                    role: 'member',
                });

            if (joinError) throw joinError;
            return groupId;
        },
        onSuccess: (groupId) => {
            queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });
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
