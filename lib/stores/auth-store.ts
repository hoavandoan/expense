import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '../types';

interface AuthState {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasCompletedOnboarding: boolean;
    isLoginSheetOpen: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
    setOnboardingComplete: () => void;
    setLoginSheetOpen: (open: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: true,
            hasCompletedOnboarding: false,
            isLoginSheetOpen: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                }),

            setSession: (session) =>
                set({
                    session,
                    isAuthenticated: !!session?.user,
                    isLoading: false,
                }),

            setLoading: (isLoading) => set({ isLoading }),

            setOnboardingComplete: () =>
                set({
                    hasCompletedOnboarding: true,
                }),

            setLoginSheetOpen: (isLoginSheetOpen) => set({ isLoginSheetOpen }),

            logout: () =>
                set({
                    user: null,
                    session: null,
                    isAuthenticated: false,
                    isLoading: false,
                    isLoginSheetOpen: false,
                    hasCompletedOnboarding: false,
                }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                hasCompletedOnboarding: state.hasCompletedOnboarding,
                // Note: user and session NOT persisted here.
                // Supabase handles auth persistence; Zustand mirrors it.
            }),
        }
    )
);
