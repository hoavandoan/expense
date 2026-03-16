import { supabase } from '../supabase';
import type { Group, GroupWithDetails } from '../types';

/**
 * Fetch all groups for the authenticated user
 */
export const fetchGroups = async (): Promise<Group[]> => {
    const { data, error } = await supabase
        .from('groups')
        .select(`
            *,
            group_members!inner(
                user_id,
                role,
                user:users(id, name, avatar_url)
            ),
            expenses(
                amount,
                paid_by,
                expense_splits(
                    user_id,
                    amount,
                    is_paid,
                    user:users(id, name, avatar_url)
                )
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((group: any) => ({
        ...group,
        inviteCode: group.invite_code,
        coverImageUrl: group.cover_image_url,
        memberCount: group.group_members?.length || 0,
        totalExpenses: group.expenses?.reduce(
            (sum: number, e: { amount: number }) => sum + e.amount,
            0
        ) || 0,
    }));
};

/**
 * Fetch a single group with full details
 */
export const fetchGroup = async (groupId: string): Promise<GroupWithDetails> => {
    const { data, error } = await supabase
        .from('groups')
        .select(`
            *,
            group_members(
                id, user_id, role, joined_at,
                user:users(id, name, email, avatar_url)
            ),
            expenses(
                id, title, description, amount, category, paid_by, created_by, expense_date, created_at,
                paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
                created_by_user:users!expenses_created_by_fkey(id, name, avatar_url),
                expense_splits(id, user_id, amount, is_paid)
            )
        `)
        .eq('id', groupId)
        .order('created_at', { ascending: false, referencedTable: 'expenses' })
        .maybeSingle();

    console.log("dataaaa", data)

    if (error) throw error;
    if (!data) throw new Error('Group not found');

    return {
        ...data,
        inviteCode: data.invite_code,
        coverImageUrl: data.cover_image_url,
        members: data.group_members?.map((m: any) => ({
            ...m,
            userId: m.user_id,
            joinedAt: m.joined_at,
            user: m.user
                ? { ...m.user, avatarUrl: m.user.avatar_url }
                : undefined,
        })),
        expenses: data.expenses?.map((e: any) => ({
            ...e,
            paidBy: e.paid_by,
            createdBy: e.created_by,
            expenseDate: e.expense_date,
            paidByUser: e.paid_by_user
                ? { ...e.paid_by_user, avatarUrl: e.paid_by_user.avatar_url }
                : undefined,
            createdByUser: e.created_by_user
                ? { ...e.created_by_user, avatarUrl: e.created_by_user.avatar_url }
                : undefined,
            expense_splits: e.expense_splits?.map((s: any) => ({
                ...s,
                userId: s.user_id,
            })),
        })),
        memberCount: data.group_members?.length || 0,
        totalExpenses: data.expenses?.reduce(
            (sum: number, e: { amount: number }) => sum + e.amount,
            0
        ) || 0,
    } as GroupWithDetails;
};

/**
 * Create a new group
 */
export const createGroup = async (input: {
    name: string;
    description?: string;
    coverImageUrl?: string;
    currency?: string;
    groupType?: string;
    inviteCode: string;
}): Promise<Group> => {
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
            invite_code: input.inviteCode,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        inviteCode: data.invite_code,
        coverImageUrl: data.cover_image_url,
    };
};

/**
 * Update group details
 */
export const updateGroup = async (
    groupId: string,
    updates: {
        name?: string;
        description?: string;
        coverImageUrl?: string;
        currency?: string;
        groupType?: string;
    }
): Promise<Group> => {
    const { data, error } = await supabase
        .from('groups')
        .update({
            name: updates.name,
            description: updates.description,
            cover_image_url: updates.coverImageUrl,
            currency: updates.currency,
            group_type: updates.groupType,
        })
        .eq('id', groupId)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        inviteCode: data.invite_code,
        coverImageUrl: data.cover_image_url,
    };
};

/**
 * Join a group using invite code or group ID
 */
export const joinGroup = async (inviteCodeOrId: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const code = inviteCodeOrId.trim().toUpperCase();
    let groupId: string | null = null;

    // Check if input looks like a UUID (group ID)
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = UUID_PATTERN.test(inviteCodeOrId.trim());

    if (isUUID) {
        const { data: group } = await supabase
            .from('groups')
            .select('id')
            .eq('id', inviteCodeOrId.trim())
            .single();

        if (group) groupId = group.id;
    }

    if (!groupId) {
        const { data: group } = await supabase
            .from('groups')
            .select('id')
            .eq('invite_code', code)
            .maybeSingle();

        if (group) groupId = group.id;
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
        .maybeSingle();

    if (existing) {
        throw new Error('Bạn đã là thành viên của nhóm này');
    }

    // Add user to group
    const { error: joinError } = await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
    });

    if (joinError) throw joinError;

    return groupId;
};

/**
 * Leave a group (non-owner only)
 */
export const leaveGroup = async (groupId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check role
    const { data: member } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

    if (member?.role === 'owner') {
        throw new Error('Owner cannot leave the group. Transfer ownership first or delete the group.');
    }

    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

    if (error) throw error;
};

/**
 * Remove a member from a group (owner/admin only)
 */
export const removeMember = async (groupId: string, userId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (userId === user.id) {
        throw new Error('Cannot remove yourself. Use leave group instead.');
    }

    // Check requesting user's role
    const { data: requestingMember } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

    if (!requestingMember) {
        throw new Error('You are not a member of this group');
    }

    const isOwnerOrAdmin = requestingMember.role === 'owner' || requestingMember.role === 'admin';
    if (!isOwnerOrAdmin) {
        throw new Error('Only owner or admin can remove members');
    }

    // Check target member exists and is not owner
    const { data: targetMember } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

    if (!targetMember) {
        throw new Error('Member not found in this group');
    }

    if (targetMember.role === 'owner') {
        throw new Error('Cannot remove the group owner');
    }

    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

    if (error) throw error;
};
