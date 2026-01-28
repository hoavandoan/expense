# Coding Conventions

## General Rules
- **TypeScript**: Strict mode is enabled. Use interfaces for props.
- **Components**: Functional components only.
- **Styling**: Use Tailwind CSS (via Uniwind). Use `cn` utility for class merging.
- **Imports**: Use `@/*` alias for project root imports.

## File Naming
- Components: `kebab-case.tsx` (e.g., `expense-card.tsx`).
- Hooks: `use-*.ts`.
- Stores: `use-*-store.ts`.

## UI Patterns
- Wrap screens in `ScreenSurface`.
- Use `heroui-native` components for standard UI elements.
- Handle safe areas using `SafeAreaProvider` and `SafeAreaView`.

## Data Handling
- Use Zod for schema validation.
- Use Supabase client from `lib/supabase.ts`.
- Use React Query for server state.
