import { create } from 'zustand';

interface GroupsState {
    activeGroupId: string | null;
    setActiveGroup: (id: string | null) => void;
}

export const useGroupsStore = create<GroupsState>((set) => ({
    activeGroupId: null,
    setActiveGroup: (id) => set({ activeGroupId: id }),
}));
