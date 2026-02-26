# Guard: Before UI Changes

> This guard MUST be loaded before creating or modifying UI components.
> It ensures visual and interaction consistency.

## Pre-Flight Checklist

### ✅ Component Selection
- [ ] HeroUI Native components used over raw React Native (`View`, `Text`, `TextInput`)
- [ ] Existing `components/ui/` wrappers checked first before creating new ones
- [ ] Lucide React Native icons (not other icon libraries)

### ✅ Styling
- [ ] `className` prop used (Uniwind/Tailwind CSS), NOT inline `style` objects
- [ ] Semantic color tokens from `app/global.css` (e.g., `--color-accent`), NOT hardcoded colors
- [ ] `oklch` color space maintained
- [ ] Dark/Light mode compatibility verified

### ✅ Layout
- [ ] `ScreenSurface` used as root wrapper
- [ ] `ScreenScrollView` for scrollable content
- [ ] No hardcoded safe area padding — use `react-native-safe-area-context`
- [ ] `FlashList` with `estimatedItemSize` for long lists

### ✅ Interactions
- [ ] `PressableFeedback` wrapping all touchable elements
- [ ] `react-native-reanimated` for animations (not Animated API)
- [ ] `Layout.springify()` for list transitions
- [ ] `FadeIn` / `FadeOut` for enter/exit animations

### ✅ Forms
- [ ] `react-hook-form` + Zod schema for all forms
- [ ] HeroUI `TextField`, `Select`, `Checkbox` for inputs
- [ ] `FieldError` for validation display

### ✅ Modals & Sheets
- [ ] Modals in `app/(modal)/` with Expo Router presentation
- [ ] `BlurView` backdrop via `dialog-blur-backdrop.tsx`
- [ ] Bottom sheets via `@gorhom/bottom-sheet`

### ✅ Typography
- [ ] Inter font for body text
- [ ] IBM Plex Sans for headings
- [ ] No system default fonts
