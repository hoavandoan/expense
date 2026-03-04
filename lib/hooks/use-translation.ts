import { i18n } from '@/lib/i18n';
import { useSettingsStore } from '@/lib/stores';
import type { TranslateOptions } from 'i18n-js';
import { useCallback } from 'react';

export function useTranslation() {
    // Subscribe to language changes so components re-render when language changes
    const language = useSettingsStore((state) => state.language);

    // Always derive the active locale to ensure reactivity
    const activeLocale = language || i18n.locale;

    const t = useCallback((key: string, options?: TranslateOptions) => {
        return i18n.t(key, { locale: activeLocale, ...options });
    }, [activeLocale]);

    return { t, locale: activeLocale };
}
