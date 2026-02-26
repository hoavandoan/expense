---
trigger: always_on
---

# Coding Standards

## Core Principles

- **✅ Immutability** rather than ❌ mutability
- **✅ Non-destructive** rather than ❌ destructive
- **✅ Declarative** rather than ❌ procedural
- **✅ Descriptive naming** rather than ❌ short/ambiguous naming

## Language & Style

- TypeScript mandatory for all code; prefer `interface` over `type`.
- Avoid enums; use maps/objects instead.
- Functional components only with TypeScript interfaces.
- Strict mode enabled.
- Use Prettier for formatting.
- File structure order: exported component → subcomponents → helpers → static content → types.

## Naming Conventions

- `kebab-case` for files and directories (e.g., `components/auth-wizard`).
- `PascalCase` for React components.
- `camelCase` for variables, functions, properties.
- Descriptive names with auxiliary verbs: `isLoading`, `hasError`, `canSubmit`.
- Favor named exports.

## Absolute Imports

Always use `@/` alias:
```typescript
import { useGroups } from '@/lib/hooks/use-groups';
```

## Error Handling

- Use Zod for runtime validation.
- Handle errors at the beginning of functions with early returns (guard clauses).
- Use `ErrorBoundary` for UI crashes.
- Use `try-catch` with user-facing feedback for async operations.

## State Management

- Server state: TanStack React Query (hooks in `lib/hooks/`).
- Global UI state: Zustand stores (in `lib/stores/`).
- Local state: `useState` minimally; prefer derived state with `useMemo`.
- Forms: `react-hook-form` + Zod schemas.

## Performance

- Memoize with `useMemo` and `useCallback` when passed to optimized children.
- Use `FlashList` instead of `FlatList` for long lists.
- Optimize images with `expo-image` (WebP, lazy loading).
- Avoid unnecessary re-renders.

## Navigation

- Use Expo Router for file-based routing.
- Dynamic routes: `group/[id]/`, `expense/[id]/`.
- Deep linking and universal links supported.

---

## Prohibited Practices

### ❌ Nested `if` with `else if`

```typescript
// ❌ BAD
const check = (x: number | null): string => {
  if (x !== null) {
    if (x > 0) {
      if (x < 10) return 'Small';
    }
  }
  return 'Other';
};

// ✅ GOOD — guard clauses
const check = (x: number | null): string => {
  if (x === null) return 'Other';
  if (x <= 0) return 'Other';
  if (x < 10) return 'Small';
  return 'Other';
};
```

### ❌ `switch` Statements

```typescript
// ❌ BAD
function getStatus(code: number): string {
  switch (code) {
    case 200: return 'OK';
    case 404: return 'Not Found';
    default: return 'Unknown';
  }
}

// ✅ GOOD — object lookup
const getStatus = (code: number): string => {
  const statusMap: Record<number, string> = { 200: 'OK', 404: 'Not Found' };
  return statusMap[code] || 'Unknown';
};
```

### ❌ Ternary as Control Structure

```typescript
// ✅ OK — single value selection
const className = isPayment ? 'payment' : 'default';

// ❌ BAD — multiple side effects in ternary
// ✅ GOOD — use if/else for control flow
if (isPayment) {
  return <PaymentComponent />;
}
return <DefaultComponent />;
```

### ❌ Nested Ternary Operators

```typescript
// ❌ BAD
const result = c1 ? (c2 ? 'A' : 'B') : 'C';

// ✅ GOOD — extract to function
const computeResult = (): string => {
  if (c1 && c2) return 'A';
  if (c1) return 'B';
  return 'C';
};
```

### ❌ Short-Circuit as Conditional Branching

```typescript
// ❌ BAD
condition && console.log('true');

// ✅ GOOD
if (condition) {
  console.log('true');
}
```

### ❌ `let` / `var`

```typescript
// ❌ BAD
let result = val * 2;
result = result + 1;

// ✅ GOOD — const + expression
const result = val * 2 + 1;
```

### ❌ Sequential Loops (`for`, `while`, `forEach`)

```typescript
// ❌ BAD
const squares: number[] = [];
for (let i = 0; i < numbers.length; i++) {
  squares.push(numbers[i] ** 2);
}

// ✅ GOOD — declarative
const squares = numbers.map((n) => n ** 2);
```

### ❌ Destructive Array Operations

Use non-destructive alternatives:

| Destructive | Non-destructive |
|---|---|
| `push()` | `[...arr, item]` |
| `pop()` | `arr.slice(0, -1)` |
| `shift()` | `arr.slice(1)` |
| `unshift()` | `[item, ...arr]` |
| `sort()` | `arr.toSorted()` or `[...arr].sort()` |
| `reverse()` | `arr.toReversed()` or `[...arr].reverse()` |
| `arr[i] = x` | `arr.with(i, x)` |

### ❌ Recursion as Loop Alternative

Use `reduce` or other higher-order functions instead.

## Comments

- Write comments to explain **why**, not **what**.
- Code should be self-explanatory through descriptive naming.
- Use `TODO:` annotations for future work.
