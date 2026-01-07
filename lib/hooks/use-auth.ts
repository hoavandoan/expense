import { useEffect } from 'react';
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

    useEffect(() => {
        // Check current session on mount
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUser({
                        id: profile.id,
                        email: profile.email,
                        name: profile.name,
                        avatarUrl: profile.avatar_url,
                        createdAt: profile.created_at,
                    });
                }
            } else {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const { data: profile } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        setUser({
                            id: profile.id,
                            email: profile.email,
                            name: profile.name,
                            avatarUrl: profile.avatar_url,
                            createdAt: profile.created_at,
                        });
                    }
                } else if (event === 'SIGNED_OUT') {
                    logout();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setLoading, logout]);

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

        const { data, error } = await supabase
            .from('users')
            .update({
                name: updates.name,
                avatar_url: updates.avatarUrl,
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        setUser({
            ...user,
            ...updates,
        });

        return data;
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
