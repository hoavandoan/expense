# Coding Conventions & UI Standards

> **Canonical source**: `.agent/rules/02-coding-standards.md` & `.agent/rules/03-ui-ux-patterns.md`

## Core Principles
- Immutability, non-destructive, declarative.
- Descriptive naming (isLoading, hasError).
- Early returns with guard clauses.
- No `switch` statements; use objects for lookup.
- No `let`/`var`; use `const` + expressions.

## UI/UX Best Practices
- Component Library: HeroUI Native (always preferred).
- Styling: Uniwind (Tailwind classNames).
- List Rendering: `@shopify/flash-list` for long lists (provide `estimatedItemSize`).
- Feedback: `PressableFeedback` for touch interaction.

## Prohibited Practices
- Nested `if` with `else if`.
- Sequential loops (`for`, `while`); use `map`, `filter`, `reduce`.
- Destructive array operations.
- Recursion as loop alternative.

