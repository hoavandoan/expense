import * as profileService from '@/lib/services/profile-service';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Platform } from 'react-native';

// ─── Constants ──────────────────────────────────────────────────
const ONBOARDING_KEY = 'has_completed_onboarding';

// ─── Interface ──────────────────────────────────────────────────
interface AuthContextValue {
    session: Session | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasCompletedOnboarding: boolean;
    isLoginSheetOpen: boolean;
    setLoginSheetOpen: (open: boolean) => void;
    setOnboardingComplete: () => void;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [isLoginSheetOpen, setLoginSheetOpen] = useState(false);

    const isAuthenticated = !!session?.user;

    // ─── Effect 1: Session state + auth listener ────────────────
    useEffect(() => {
        let isMounted = true;

        const initSession = async () => {
            try {
                // Read onboarding flag
                if (Platform.OS !== 'web') {
                    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
                    if (isMounted && value === 'true') {
                        setHasCompletedOnboarding(true);
                    }
                }

                // Restore session from storage
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                if (isMounted) {
                    setSession(initialSession);
                }
            } catch (err) {
                console.error('[Auth] Init error:', err);
            }
        };

        initSession();

        // Listen for auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            if (!isMounted) return;
            setSession(currentSession);

            if (_event === 'SIGNED_OUT') {
                setUser(null);
                queryClient.clear();
            } else if (_event === 'TOKEN_REFRESHED') {
                queryClient.invalidateQueries();
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [queryClient]);

    // ─── Effect 2: Fetch profile when session changes ───────────
    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            setIsLoading(true);

            if (session?.user) {
                try {
                    const profile = await profileService.fetchProfile(session.user.id);
                    if (isMounted && profile) {
                        setUser(profile);
                    }
                } catch (error: any) {
                    console.error('[Auth] Profile fetch error:', error);

                    // Handle expired/invalid session
                    const isAuthError =
                        error.status === 401 ||
                        error.message?.includes('Invalid or expired token') ||
                        error.message?.includes('JWT expired');

                    if (isAuthError) {
                        await supabase.auth.signOut().catch(() => {});
                        return;
                    }
                }
            } else {
                setUser(null);
            }

            if (isMounted) {
                setIsLoading(false);
            }
        };

        fetchProfile();

        // Invalidate queries when session becomes available
        if (session?.user) {
            queryClient.invalidateQueries();
        }

        return () => {
            isMounted = false;
        };
    }, [session, queryClient]);

    // ─── Actions ────────────────────────────────────────────────

    const setOnboardingComplete = useCallback(() => {
        setHasCompletedOnboarding(true);
        if (Platform.OS !== 'web') {
            SecureStore.setItemAsync(ONBOARDING_KEY, 'true').catch(console.error);
        }
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('[Auth] Sign out error:', error);
        }
        // onAuthStateChange → SIGNED_OUT handles cleanup
    }, []);

    const updateProfile = useCallback(
        async (updates: Partial<User>) => {
            if (!user) throw new Error('Not authenticated');

            const profile = await profileService.updateProfile(user.id, {
                name: updates.name,
                avatarUrl: updates.avatarUrl ?? undefined,
            });

            setUser(profile);
            return profile;
        },
        [user]
    );

    // ─── Memoized value ─────────────────────────────────────────

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            user,
            isAuthenticated,
            isLoading,
            hasCompletedOnboarding,
            isLoginSheetOpen,
            setLoginSheetOpen,
            setOnboardingComplete,
            setUser,
            signOut,
            updateProfile,
        }),
        [
            session,
            user,
            isAuthenticated,
            isLoading,
            hasCompletedOnboarding,
            isLoginSheetOpen,
            setOnboardingComplete,
            signOut,
            updateProfile,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
