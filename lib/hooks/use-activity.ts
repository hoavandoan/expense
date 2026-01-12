import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { ActivityLog } from '../types';

const ACTIVITY_KEY = ['activity-log'];

/**
 * Fetch activity log for a group
 */
export const useGroupActivity = (
  groupId: string | null,
  options?: { limit?: number; actionType?: string }
) => {
  return useQuery({
    queryKey: [...ACTIVITY_KEY, 'group', groupId, options],
    queryFn: async () => {
      if (!groupId) return [];

      let query = supabase
        .from('activity_log')
        .select(`
          *,
          user:users(id, name, avatar_url),
          group:groups(id, name)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (options?.actionType) {
        query = query.eq('action_type', options.actionType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id,
        groupId: a.group_id,
        userId: a.user_id,
        actionType: a.action_type,
        metadata: a.metadata || {},
        createdAt: a.created_at,
        user: a.user ? {
          id: a.user.id,
          name: a.user.name,
          avatarUrl: a.user.avatar_url,
          email: '',
          createdAt: '',
        } : undefined,
        group: a.group ? {
          id: a.group.id,
          name: a.group.name,
          description: null,
          coverImageUrl: null,
          inviteCode: '',
          currency: '',
          groupType: 'other' as const,
          createdBy: '',
          createdAt: '',
        } : undefined,
      })) as ActivityLog[];
    },
    enabled: !!groupId,
  });
};

/**
 * Fetch recent activity across all user's groups
 */
export const useRecentActivity = (limit: number = 20) => {
  return useQuery({
    queryKey: [...ACTIVITY_KEY, 'recent', limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all group IDs the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) return [];

      const groupIds = memberships.map((m) => m.group_id);

      // Fetch recent activities from those groups
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
      return (data || []).map((a: any) => ({
        id: a.id,
        groupId: a.group_id,
        userId: a.user_id,
        actionType: a.action_type,
        metadata: a.metadata || {},
        createdAt: a.created_at,
        user: a.user ? {
          id: a.user.id,
          name: a.user.name,
          avatarUrl: a.user.avatar_url,
          email: '',
          createdAt: '',
        } : undefined,
        group: a.group ? {
          id: a.group.id,
          name: a.group.name,
          description: null,
          coverImageUrl: null,
          inviteCode: '',
          currency: '',
          groupType: 'other' as const,
          createdBy: '',
          createdAt: '',
        } : undefined,
      })) as ActivityLog[];
    },
  });
};
