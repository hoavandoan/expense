import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import * as profileService from '../services/profile-service';
import { useAuthStore } from '../stores/auth-store';
import { supabase } from '../supabase';
import type { User } from '../types';

/**
 * Hook to manage authentication state
 * Follows Supabase official pattern for session management
 */
export const useAuth = () => {
    const {
        user,
        session,
        isAuthenticated,
        isLoading,
        isLoginSheetOpen,
        setUser,
        setSession,
        setLoading,
        setLoginSheetOpen,
        logout,
    } = useAuthStore();

    const queryClient = useQueryClient();

    // ACTIONS
    const fetchProfile = useCallback(async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error('Not authenticated');

            const profile = await profileService.fetchProfile(authUser.id);
            if (profile) {
                setUser(profile);
            }
        } catch (error: any) {
            console.error('[Auth] Error fetching profile:', error);

            // If it's an auth error (401 or Invalid token message), 
            // we should perform a clean logout to prevent infinite loop or broken state
            const isAuthError = error.status === 401 ||
                error.message?.includes('Invalid or expired token') ||
                error.message?.includes('JWT expired');

            if (isAuthError) {
                console.warn('[Auth] Redirecting to login due to auth error');
                logout();
            } else {
                setLoading(false);
            }
        }
    }, [setUser, setLoading, logout]);

    /**
     * Initialize session on app start
     * Should only be called ONCE at the root level
     */
    const initializeAuth = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            setSession(initialSession);

            if (initialSession?.user) {
                await fetchProfile();
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error('[Auth] Initialization error:', err);
            setLoading(false);
        }
    }, [fetchProfile, setLoading, setSession]);

    /**
     * Set up auth state change listener
     * Should only be called ONCE at the root level
     */
    const setupAuthListener = useCallback(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                console.log('[Auth] State Change Event:', event);

                // Update session in store
                setSession(currentSession);

                if (event === 'SIGNED_IN' && currentSession?.user) {
                    await fetchProfile();
                    queryClient.invalidateQueries();
                } else if (event === 'SIGNED_OUT') {
                    logout();
                    queryClient.clear();
                } else if (event === 'TOKEN_REFRESHED') {
                    queryClient.invalidateQueries();
                }
            }
        );

        return subscription;
    }, [fetchProfile, logout, setSession, queryClient]);

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
        console.log('signOut', error);
        if (error) throw error;
        logout();
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) throw new Error('Not authenticated');

        const profile = await profileService.updateProfile(user.id, {
            name: updates.name,
            avatarUrl: updates.avatarUrl ?? undefined,
        });

        setUser(profile);
        return profile;
    };

    return {
        user,
        session,
        isAuthenticated,
        isLoading,
        isLoginSheetOpen,
        setLoginSheetOpen,
        setUser,
        initializeAuth,
        setupAuthListener,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
    };
};
