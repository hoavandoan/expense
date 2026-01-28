import { useCallback, useEffect } from 'react';
import { apiClient } from '../api-client';
import { useAuthStore } from '../stores/auth-store';
import { supabase } from '../supabase';
import type { User } from '../types';

/**
 * Hook to manage authentication state
 */
export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        isLoginSheetOpen,
        setUser,
        setLoading,
        setLoginSheetOpen,
        logout,
    } = useAuthStore();

    const fetchProfile = useCallback(async () => {
        try {
            const profile = await apiClient<User>('/profile');
            if (profile) {
                setUser(profile);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    }, [setUser, setLoading]);

    useEffect(() => {
        // Check current session on mount
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchProfile();
            } else {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await fetchProfile();
                } else if (event === 'SIGNED_OUT') {
                    logout();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile, logout, setLoading]);

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signUpWithEmail = async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        logout();
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) throw new Error('Not authenticated');

        const profile = await apiClient<User>('/profile', {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });

        setUser(profile);
        return profile;
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        isLoginSheetOpen,
        setLoginSheetOpen,
        setUser,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
    };
};

