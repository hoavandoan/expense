# Guard: Before Code Generation

> This guard MUST be loaded before generating any code.
> It ensures AI follows project conventions.

## Pre-Flight Checklist

Before writing any code, verify these rules are loaded:

### ✅ TypeScript
- [ ] All new code uses TypeScript (`.ts` / `.tsx`)
- [ ] `interface` used instead of `type` for object shapes
- [ ] Strict mode patterns applied
- [ ] No `any` types unless absolutely necessary

### ✅ Immutability
- [ ] `const` used everywhere (no `let` / `var`)
- [ ] Non-destructive array operations (no `push`, `pop`, `shift`, `sort`)
- [ ] Spread syntax for object/array updates

### ✅ Declarative Style
- [ ] No `for` / `while` / `forEach` loops — use `map`, `filter`, `reduce`
- [ ] No `switch` statements — use object lookup
- [ ] No nested ternary — extract to function
- [ ] Guard clauses (early return) instead of nested `if`

### ✅ Project Conventions
- [ ] Imports use `@/` alias (e.g., `import { X } from '@/lib/...'`)
- [ ] File naming: `kebab-case`
- [ ] Component naming: `PascalCase`
- [ ] Variable naming: `camelCase` with auxiliary verbs (`isLoading`, `hasError`)

### ✅ State Management
- [ ] Server state → TanStack React Query hooks (in `lib/hooks/`)
- [ ] Global state → Zustand stores (in `lib/stores/`)
- [ ] Form state → `react-hook-form` + Zod
- [ ] Local state → `useState` only when necessary

### ✅ Error Handling
- [ ] Zod validation for inputs
- [ ] `try-catch` with user feedback for async operations
- [ ] `ErrorBoundary` wrapping for crash safety
