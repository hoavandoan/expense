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
- Use **HeroUI Native** components as the primary building blocks.
- Prefer **Tailwind CSS** (via Uniwind) for layout and spacing.
- Follow the design system tokens defined in `global.css`.
- Ensure all interactive elements have safe touch areas and provide feedback using `PressableFeedback`.

## Testing & Validation
- Use **Zod** for runtime schema validation (forms, API responses).
- (TODO: Define testing framework and standards as they are introduced).
