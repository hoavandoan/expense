# Coding Conventions

## Language & Style
- **TypeScript**: Mandatory for all logic. Use `interface` for object structures.
- **Components**: Functional components only. Use hooks for state and side effects.
- **Naming**:
    - `kebab-case` for file and directory names.
    - `PascalCase` for React components.
    - `camelCase` for variables, functions, and properties.
- **Absolute Imports**: Always use `@/` alias from the project root.

## Best Practices
- **Early Returns**: Use early returns to avoid nested `if` statements.
- **Immutability**: Prefer `const`, avoid mutation of state or props.
- **Declarative Code**: Use array methods (`map`, `filter`, `reduce`) instead of `for` loops.
- **Error Handling**: Use `ErrorBoundary` for UI crashes and `try-catch` with appropriate user feedback for async operations.
- **Performance**: Memoize expensive calculations with `useMemo` and callbacks with `useCallback` when passed to optimized children.

## UI & Styling
- **Design System**: Built on HeroUI Native components and Uniwind (Tailwind CSS for React Native).
- **Global Styles**: Design tokens and semantic variables are defined in `app/global.css` using `oklch` for color precision.
- **Theming**: Supports Dark/Light modes through CSS variables and `AppThemeProvider`.
- **Layout**: Use `ScreenSurface` and `ScreenScrollView` for consistent screen structures.
- **Micro-interactions**: Use `PressableFeedback` for all touch targets to provide instant haptic and visual feedback.
- **Typography**: Custom fonts (Inter, IBM Plex Sans) are managed globally in `RootLayout`.

## Testing & Validation
- Use **Zod** for runtime schema validation (forms, API responses).
