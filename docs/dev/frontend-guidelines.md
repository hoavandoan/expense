# Frontend Developer Guidelines

## 1. Component Architecture

### directory Structure
- `app/`: **Screens/Pages** only. Minimal logic, focus on layout and routing parameters.
- `components/ui/`: **Atomic Components** (Buttons, Cards, Inputs). Strictly presentational.
- `components/[feature]/`: **Feature Components** (e.g., `components/home/BalanceCard.tsx`). Can contain business logic/hooks.

### Component Anatomy
```tsx
// Example: components/ui/card.tsx
import { View, ViewProps } from 'react-native';
import { cn } from 'heroui-native';

export function Card({ className, ...props }: ViewProps) {
  // Always support 'className' prop for overrides
  return (
    <View 
      className={cn("bg-surface rounded-2xl border border-divider/10", className)} 
      {...props} 
    />
  );
}
```

## 2. Styling System (Uniwind)

We use **Uniwind** (Tailwind for Native).

### Core Rules
- **Colors**: Use semantic names (`text-accent`, `bg-surface`, `border-danger`) instead of raw hex codes.
- **Spacing**: Use standard scale (`p-4` = 16px, `m-2` = 8px).
- **Dark Mode**: Configured via CSS variables in `global.css`. Do not manually write `dark:bg-black` classes unless creating a specific override; reliance on semantic variables (`bg-background`) handles this automatically.

### Typography
Use the `AppText` component or standard `Text` with `font-*` classes.
- `font-bold` -> Inter Bold
- `font-heading-bold` -> IBM Plex Sans Bold

## 3. State Management

- **Local UI State**: `useState` / `useReducer`.
- **Global UI State**: `Zustand` (Theme, Toast, Auth Session).
- **Server Data**: `TanStack React Query`. **Do not** store API responses in Zustand.

## 4. Performance Checklist
- [ ] Use `FlashList` or `FlatList` for long lists.
- [ ] Wrap press interactions in `PressableFeedback`.
- [ ] Use `useCallback` for event handlers passed to children.
- [ ] Profile renders with React DevTools if UI feels sluggish.
