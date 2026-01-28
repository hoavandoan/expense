import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { ActivityLog } from '../types';

export const groupActivityQueryOptions = (groupId: string | null, options?: { limit?: number; actionType?: string }) => queryOptions({
  queryKey: ['activity-log', 'group', groupId, options],
  queryFn: () => apiClient<ActivityLog[]>(`/activity?groupId=${groupId}${options?.actionType ? `&actionType=${options.actionType}` : ''}${options?.limit ? `&limit=${options.limit}` : ''}`),
  enabled: !!groupId,
});

export const recentActivityQueryOptions = (limit = 20) => queryOptions({
  queryKey: ['activity-log', 'recent', limit],
  queryFn: () => apiClient<ActivityLog[]>(`/activity?limit=${limit}`),
});

/**
 * Fetch activity log for a group
 */
export const useGroupActivity = (
  groupId: string | null,
  options?: { limit?: number; actionType?: string }
) => {
  return useQuery(groupActivityQueryOptions(groupId, options));
};

/**
 * Fetch recent activity across all user's groups
 */
export const useRecentActivity = (limit: number = 20) => {
  return useQuery(recentActivityQueryOptions(limit));
};

