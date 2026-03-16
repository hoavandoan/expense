import { supabase } from '../supabase';
import type { ActivityLog } from '../types';

interface ActivityOptions {
    actionType?: string;
    limit?: number;
}

// Transform snake_case DB row → camelCase ActivityLog
const transformActivity = (row: any): ActivityLog => ({
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    actionType: row.action_type,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    user: row.user
        ? {
            id: row.user.id,
            name: row.user.name,
            avatarUrl: row.user.avatar_url,
            email: '',
            createdAt: '',
        }
        : undefined,
    group: row.group
        ? ({
            id: row.group.id,
            name: row.group.name,
        } as any)
        : undefined,
});

/**
 * Fetch activity log for a specific group
 */
export const fetchGroupActivity = async (
    groupId: string,
    options?: ActivityOptions
): Promise<ActivityLog[]> => {
    const limit = options?.limit ?? 20;

    let query = supabase
        .from('activity_log')
        .select(`
            *,
            user:users(id, name, avatar_url),
            group:groups(id, name)
        `)
        .eq('group_id', groupId);

    if (options?.actionType) {
        query = query.eq('action_type', options.actionType);
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return (data || []).map(transformActivity);
};

/**
 * Fetch recent activity across all groups the user belongs to
 */
export const fetchRecentActivity = async (limit = 20): Promise<ActivityLog[]> => {
    // Find groups user is in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

    const groupIds = memberships?.map((m) => m.group_id) || [];
    if (groupIds.length === 0) return [];

    const { data, error } = await supabase
        .from('activity_log')
        .select(`
            *,
            user:users(id, name, avatar_url),
            group:groups(id, name)
        `)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return (data || []).map(transformActivity);
};
