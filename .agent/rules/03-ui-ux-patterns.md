---
trigger: always_on
---

# UI/UX Patterns

## Design System

- **Component Library**: HeroUI Native — always prefer HeroUI components over raw React Native components.
- **Styling**: Uniwind (Tailwind CSS for React Native) — use className prop, not inline styles.
- **Icons**: Lucide React Native (`lucide-react-native`).
- **Design Tokens**: Defined in `app/global.css` using `oklch` color space.
- **Theme**: Dark/Light mode via CSS variables and `AppThemeProvider`.

## Component Hierarchy

```
HeroUI Native components (Button, Card, Input, etc.)
    └── Project wrappers in components/ui/
        └── Feature components (components/home/, components/auth/, etc.)
            └── Screen components (app/ routes)
```

## Screen Layout Standards

- **Root wrapper**: Use `ScreenSurface` for consistent screen backgrounds.
- **Scrollable screens**: Use `ScreenScrollView` (wraps SafeAreaScrollView).
- **Safe area**: Handled via `react-native-safe-area-context` — never hardcode padding for notches.
- **Headers with parallax**: Use `components/parallax-header/` for scroll-animated headers.

## Interaction Patterns

- **Touch feedback**: Wrap all pressable elements with `PressableFeedback` for haptic + visual feedback.
- **Animations**: Use `react-native-reanimated` for all animations.
  - Prefer `Layout.springify()` for list item transitions.
  - Use `FadeIn`, `FadeOut` for enter/exit animations.
  - Spring-based animations preferred over timing-based.
- **Gestures**: Use `react-native-gesture-handler` for swipe, pan, pinch gestures.

## List Rendering

- Use `FlashList` (from `@shopify/flash-list`) instead of `FlatList` for long lists.
- Always provide `estimatedItemSize` prop.
- Memoize list items with `React.memo`.

## Typography

- **Primary font**: Inter (body text).
- **Secondary font**: IBM Plex Sans (headings, emphasis).
- Fonts managed globally in `RootLayout` via `expo-font`.

## Color System

- Colors defined as CSS variables in `app/global.css`.
- Use semantic color names (e.g., `--color-accent`, `--color-danger`), not raw values.
- All colors in `oklch` format for perceptual uniformity.

## Form Patterns

- Use `react-hook-form` + Zod schemas for all forms.
- HeroUI Native `TextField`, `Select`, `Checkbox` for form inputs.
- Display validation errors with `FieldError` component.

## Modal Patterns

- Modals defined in `app/(modal)/` using Expo Router modal presentation.
- Use `BlurView` backdrop via `dialog-blur-backdrop.tsx`.
- Bottom sheets via `@gorhom/bottom-sheet` with blur overlay.

## Component Anatomy

All UI components should follow this presentational pattern to remain flexible:
```tsx
import { View, ViewProps } from 'react-native';
import { cn } from 'heroui-native';

export function CustomComponent({ className, ...props }: ViewProps) {
  return (
    <View 
      className={cn("bg-surface rounded-2xl", className)} 
      {...props} 
    />
  );
}
```

## Performance Checklist
- [ ] Use `FlashList` for lists with over 20 items.
- [ ] Wrap all pressable areas in `PressableFeedback`.
- [ ] Memoize list items with `React.memo`.
- [ ] Avoid large inline logic/styles in the `app/` (Screen) layer.
