import { queryOptions, useQuery } from '@tanstack/react-query';
import * as activityService from '../services/activity-service';
import { useAuthStore } from '../stores/auth-store';
import type { ActivityLog } from '../types';

export const groupActivityQueryOptions = (groupId: string | null, options?: { limit?: number; actionType?: string }) => queryOptions({
  queryKey: ['activity-log', 'group', groupId, options],
  queryFn: () => activityService.fetchGroupActivity(groupId!, options),
  enabled: !!groupId,
});

export const recentActivityQueryOptions = (limit = 20) => queryOptions({
  queryKey: ['activity-log', 'recent', limit],
  queryFn: () => activityService.fetchRecentActivity(limit),
});

/**
 * Fetch activity log for a group
 */
export const useGroupActivity = (
  groupId: string | null,
  options?: { limit?: number; actionType?: string }
) => {
  const session = useAuthStore((state) => state.session);
  return useQuery({
    ...groupActivityQueryOptions(groupId, options),
    enabled: !!session && !!groupId,
  });
};

/**
 * Fetch recent activity across all user's groups
 */
export const useRecentActivity = (limit: number = 20) => {
  const session = useAuthStore((state) => state.session);
  return useQuery({
    ...recentActivityQueryOptions(limit),
    enabled: !!session,
  });
};
