# PLAN-i18n-expo

## Project Plan: Integrate i18n-js with expo-localization

### Context
- **Goal:** Add internationalization (i18n) to the Expo React Native app using `i18n-js` and `expo-localization`.
- **Requirements:** 
  - The default language should be inferred from the device's OS setting.
  - The user must be able to manually override and change the language from within the application's Settings screen.
  - Initial supported languages: Vietnamese (`vi`) and English (`en`).
- **Frameworks:** Expo Router, zustand (for state), HeroUI Native (for UI).

---

### Task Breakdown

#### Phase 1: Setup and Configuration
- [OK] **Install Dependencies:** Run `bun add i18n-js expo-localization`.
- [ ] **Create Translation Files:**
  - Create `lib/i18n/locales/en.json`
  - Create `lib/i18n/locales/vi.json`
- [ ] **Initialize i18n:**
  - Create `lib/i18n/index.ts` to configure `i18n-js`.
  - Import translations and set up fallback language.
  - Use `getLocales()` from `expo-localization` to determine the initial default language.

#### Phase 2: State Management & Persistence
- [ ] **Create Language Store:**
  - Create or update a Zustand store (e.g., `lib/stores/use-settings-store.ts`) to manage the selected language state.
  - Ensure the selected language is persisted across app restarts (e.g., using `AsyncStorage`).
- [ ] **Sync i18n with Store:**
  - Ensure that when the Zustand store state updates, `i18n.locale` is updated accordingly.

#### Phase 3: UI Integration
- [ ] **Update Settings Screen:**
  - Locate the Settings screen (e.g., `app/(tabs)/settings.tsx`).
  - Add a language selection UI (e.g., a `Select` component or a list of options) using HeroUI components.
  - Hook the UI up to the Zustand store's update function.

#### Phase 4: Implementation (String Replacement)
- [ ] **Refactor Core UI Strings:** Replace hardcoded strings on key screens (Home, Activity, Settings, Modals,...) with `i18n.t('key')`.
- [ ] **Test Language Switching:** Verify that changing the language updates the UI across the app in real-time.

---

### Verification Checklist
- [ ] Device locale is correctly detected on first launch.
- [ ] User can switch from English to Vietnamese.
- [ ] User can switch from Vietnamese to English.
- [ ] Selected language persists after restarting the application.
- [ ] UI components update dynamically without requiring a hard refresh when language is switched manually.
