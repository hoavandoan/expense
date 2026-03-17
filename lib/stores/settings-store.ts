import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '@/lib/i18n';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
    language: string | null;
    setLanguage: (lang: string) => void;
}

const getSystemLocale = () => {
    const sys = getLocales()[0]?.languageCode ?? 'en';
    return ['en', 'vi'].includes(sys) ? sys : 'en';
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: null, // null means use system default initially

            setLanguage: (lang: string) => {
                i18n.locale = lang;
                set({ language: lang });
            },
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                // When storage is rehydrated, set the i18n locale
                if (state && state.language) {
                    i18n.locale = state.language;
                } else {
                    i18n.locale = getSystemLocale();
                }
            },
        }
    )
);
