import { supabase } from '../supabase';
import type { Expense, Group, User } from '../types';

interface SearchResult {
    expenses: Expense[];
    groups: Group[];
    users: User[];
}

/**
 * Search across expenses, groups, and users in the user's groups
 */
export const searchAll = async (query: string, limit = 10): Promise<SearchResult> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!query || query.trim().length < 2) {
        return { expenses: [], groups: [], users: [] };
    }

    const searchQuery = query.trim();

    // 1. Get user's group IDs
    const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

    const groupIds = memberships?.map((m) => m.group_id) || [];

    if (groupIds.length === 0) {
        return { expenses: [], groups: [], users: [] };
    }

    // 2. Parallel search
    const [expensesResult, groupsResult, usersResult] = await Promise.all([
        // Search expenses
        supabase
            .from('expenses')
            .select(`
                id, title, description, amount, category, created_at, group_id,
                paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
                group:groups(id, name, currency)
            `)
            .in('group_id', groupIds)
            .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
            .order('created_at', { ascending: false })
            .limit(limit),

        // Search groups
        supabase
            .from('groups')
            .select('id, name, description, cover_image_url, currency')
            .in('id', groupIds)
            .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
            .order('created_at', { ascending: false })
            .limit(limit),

        // Search users (in user's groups)
        supabase
            .from('group_members')
            .select('user:users(id, name, email, avatar_url)')
            .in('group_id', groupIds)
            .neq('user_id', user.id)
            .limit(limit * 3), // Fetch more since we filter client-side
    ]);

    if (expensesResult.error) throw expensesResult.error;
    if (groupsResult.error) throw groupsResult.error;
    if (usersResult.error) throw usersResult.error;

    // Client-side filter for users (name/email match)
    const filteredUsers = (usersResult.data || [])
        .map((m: any) => m.user)
        .filter(
            (u: any) =>
                u &&
                (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, limit);

    return {
        expenses: (expensesResult.data || []).map((e: any) => ({
            ...e,
            groupId: e.group_id,
            paidByUser: e.paid_by_user
                ? { ...e.paid_by_user, avatarUrl: e.paid_by_user.avatar_url }
                : undefined,
        })),
        groups: (groupsResult.data || []).map((g: any) => ({
            ...g,
            coverImageUrl: g.cover_image_url,
        })),
        users: filteredUsers.map((u: any) => ({
            ...u,
            avatarUrl: u.avatar_url,
        })),
    };
};
