import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { Notification } from '../types';

const NOTIFICATIONS_KEY = ['notifications'];

export const notificationsQueryOptions = (options?: { limit?: number; unreadOnly?: boolean }) => queryOptions({
  queryKey: [...NOTIFICATIONS_KEY, options],
  queryFn: () => apiClient<Notification[]>('/notifications', { params: options as any }),
});

export const unreadCountQueryOptions = () => queryOptions({
  queryKey: [...NOTIFICATIONS_KEY, 'unread-count'],
  queryFn: async () => {
    const notifications = await apiClient<Notification[]>('/notifications', { params: { unreadOnly: 'true' } });
    return notifications.length;
  },
});

/**
 * Fetch all notifications for the current user
 */
export const useNotifications = (options?: { limit?: number; unreadOnly?: boolean }) => {
  return useQuery(notificationsQueryOptions(options));
};

/**
 * Fetch unread notifications count
 */
export const useUnreadNotificationsCount = () => {
  return useQuery(unreadCountQueryOptions());
};

/**
 * Mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiClient(`/notifications`, {
      method: 'PATCH',
      body: JSON.stringify({ notificationId }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient('/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ allAsRead: true }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

/**
 * Delete notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiClient(`/notifications/${notificationId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

