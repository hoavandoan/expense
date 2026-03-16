import { supabase } from '../supabase';
import type { Notification } from '../types';

// Transform snake_case DB row → camelCase Notification
const transformNotification = (row: any): Notification => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    metadata: row.metadata || {},
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
});

/**
 * Fetch notifications for the authenticated user
 */
export const fetchNotifications = async (
    options?: { limit?: number; unreadOnly?: boolean }
): Promise<Notification[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const limit = options?.limit ?? 20;

    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
        query = query.eq('is_read', false);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    return (data || []).map(transformNotification);
};

/**
 * Mark a single notification as read
 */
export const markNotificationRead = async (notificationId: string): Promise<any> => {
    const { data, error } = await supabase
        .from('notifications')
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Mark all notifications as read for the authenticated user
 */
export const markAllNotificationsRead = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('notifications')
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) throw error;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

    if (error) throw error;
};
