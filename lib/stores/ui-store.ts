import { create } from 'zustand';

interface UIState {
    // Toast
    toastMessage: string | null;
    toastType: 'success' | 'error' | 'info' | null;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    hideToast: () => void;

    // Loading overlay
    isGlobalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;

    // Refresh triggers
    shouldRefreshGroups: boolean;
    triggerGroupsRefresh: () => void;
    clearGroupsRefresh: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Toast state
    toastMessage: null,
    toastType: null,
    showToast: (message, type = 'info') =>
        set({ toastMessage: message, toastType: type }),
    hideToast: () => set({ toastMessage: null, toastType: null }),

    // Loading state
    isGlobalLoading: false,
    setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

    // Refresh triggers
    shouldRefreshGroups: false,
    triggerGroupsRefresh: () => set({ shouldRefreshGroups: true }),
    clearGroupsRefresh: () => set({ shouldRefreshGroups: false }),
}));
