import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './locales/en.json';
import vi from './locales/vi.json';

// Set the key-value pairs for the different languages you want to support.
const i18n = new I18n({
    en,
    vi,
});

// Set the locale once at the beginning of your app based on device settings.
const systemLocale = getLocales()[0]?.languageCode ?? 'en';
i18n.locale = ['en', 'vi'].includes(systemLocale) ? systemLocale : 'en';

// When a value is missing from a language it'll fall back to another language with the key present.
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export { i18n };
