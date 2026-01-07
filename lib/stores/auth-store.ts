import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasCompletedOnboarding: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setOnboardingComplete: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            hasCompletedOnboarding: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                }),

            setLoading: (isLoading) => set({ isLoading }),

            setOnboardingComplete: () =>
                set({
                    hasCompletedOnboarding: true,
                }),

            logout: () =>
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    // Keep hasCompletedOnboarding true after logout
                }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
            }),
        }
    )
);
