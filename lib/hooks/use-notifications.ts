import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsService from '../services/notifications-service';
import { useAuthStore } from '../stores/auth-store';
import type { Notification } from '../types';

const NOTIFICATIONS_KEY = ['notifications'];

export const notificationsQueryOptions = (options?: { limit?: number; unreadOnly?: boolean }) => queryOptions({
  queryKey: [...NOTIFICATIONS_KEY, options],
  queryFn: () => notificationsService.fetchNotifications(options),
});

export const unreadCountQueryOptions = () => queryOptions({
  queryKey: [...NOTIFICATIONS_KEY, 'unread-count'],
  queryFn: async () => {
    const notifications = await notificationsService.fetchNotifications({ unreadOnly: true });
    return notifications.length;
  },
});

/**
 * Fetch all notifications for the current user
 */
export const useNotifications = (options?: { limit?: number; unreadOnly?: boolean }) => {
  const session = useAuthStore((state) => state.session);
  return useQuery({
    ...notificationsQueryOptions(options),
    enabled: !!session,
  });
};

/**
 * Fetch unread notifications count
 */
export const useUnreadNotificationsCount = () => {
  const session = useAuthStore((state) => state.session);
  return useQuery({
    ...unreadCountQueryOptions(),
    enabled: !!session,
  });
};

/**
 * Mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

      const previousNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_KEY);

      // Optimistically update the specific notification
      queryClient.setQueriesData<Notification[]>({ queryKey: NOTIFICATIONS_KEY }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((n) => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n);
      });

      // Also invalidate/update unread count
      const previousCount = queryClient.getQueryData<number>([...NOTIFICATIONS_KEY, 'unread-count']);
      if (typeof previousCount === 'number') {
        queryClient.setQueryData([...NOTIFICATIONS_KEY, 'unread-count'], Math.max(0, previousCount - 1));
      }

      return { previousNotifications, previousCount };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previousNotifications);
      }
      if (typeof context?.previousCount === 'number') {
        queryClient.setQueryData([...NOTIFICATIONS_KEY, 'unread-count'], context.previousCount);
      }
    },
    onSettled: () => {
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
    mutationFn: () => notificationsService.markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

      const previousNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_KEY);

      // Optimistically update all notifications
      queryClient.setQueriesData<Notification[]>({ queryKey: NOTIFICATIONS_KEY }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }));
      });

      // Reset unread count to 0
      const previousCount = queryClient.getQueryData<number>([...NOTIFICATIONS_KEY, 'unread-count']);
      queryClient.setQueryData([...NOTIFICATIONS_KEY, 'unread-count'], 0);

      return { previousNotifications, previousCount };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previousNotifications);
      }
      if (typeof context?.previousCount === 'number') {
        queryClient.setQueryData([...NOTIFICATIONS_KEY, 'unread-count'], context.previousCount);
      }
    },
    onSettled: () => {
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
    mutationFn: (notificationId: string) => notificationsService.deleteNotification(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

      const previousNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_KEY);

      // Find if we're deleting an unread one to update count
      const target = previousNotifications?.find(n => n.id === notificationId);
      const wasUnread = target && !target.isRead;

      // Optimistically remove from all notification queries
      queryClient.setQueriesData<Notification[]>({ queryKey: NOTIFICATIONS_KEY }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((n) => n.id !== notificationId);
      });

      let previousCount: number | undefined;
      if (wasUnread) {
        previousCount = queryClient.getQueryData<number>([...NOTIFICATIONS_KEY, 'unread-count']);
        if (typeof previousCount === 'number') {
          queryClient.setQueryData([...NOTIFICATIONS_KEY, 'unread-count'], Math.max(0, previousCount - 1));
        }
      }

      return { previousNotifications, previousCount };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previousNotifications);
      }
      if (typeof context?.previousCount === 'number') {
        queryClient.setQueryData([...NOTIFICATIONS_KEY, 'unread-count'], context.previousCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};
