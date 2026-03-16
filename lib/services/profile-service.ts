import { supabase } from '../supabase';
import type { User } from '../types';

/**
 * Fetch profile for the authenticated user
 */
export const fetchProfile = async (userId: string): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
    };
};

/**
 * Update profile for the authenticated user
 */
export const updateProfile = async (
    userId: string,
    updates: { name?: string; avatarUrl?: string }
): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .update({
            name: updates.name,
            avatar_url: updates.avatarUrl,
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
    };
};
