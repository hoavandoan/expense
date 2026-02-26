# Architectural Decisions — Living Context

> Lightweight ADR (Architecture Decision Record) log.
> Record key decisions here so AI doesn't re-propose rejected alternatives.

## ADR-001: Expo Managed Workflow
- **Decision**: Use Expo Managed Workflow (not bare).
- **Reason**: Faster iteration, OTA updates, no native module management needed.
- **Trade-off**: Limited access to some native APIs.

## ADR-002: Supabase as BaaS
- **Decision**: Use Supabase for auth, database, and realtime.
- **Reason**: PostgreSQL with RLS, built-in auth, realtime subscriptions, generous free tier.
- **Trade-off**: Vendor lock-in for auth and realtime features.

## ADR-003: TanStack Query for Server State
- **Decision**: Use TanStack React Query v5, not Redux or SWR.
- **Reason**: Optimistic updates, cache invalidation, background refetch built-in.
- **Trade-off**: Learning curve for queryOptions pattern.

## ADR-004: HeroUI Native + Uniwind
- **Decision**: Use HeroUI Native as UI component library with Uniwind for styling.
- **Reason**: Tailwind CSS-compatible styling in React Native, consistent design tokens.
- **Trade-off**: Beta library, potential breaking changes.

## ADR-005: Zustand over Context for Global State
- **Decision**: Use Zustand for global state (auth, UI), not React Context alone.
- **Reason**: Simpler API, no provider hell, better performance (selective re-renders).
- **Trade-off**: Additional dependency.

## ADR-006: VietQR for Payments
- **Decision**: Integrate VietQR for payment confirmation.
- **Reason**: Vietnam-specific payment standard, widely supported by banks.
- **Trade-off**: Vietnam-only feature.

## ADR-007: Expo API Routes for Server Logic
- **Decision**: Use Expo API Routes (`app/api/`) for server-side operations.
- **Reason**: Same codebase, TypeScript shared types, no separate backend deployment.
- **Trade-off**: Limited to EAS Hosting for deployment.

## ADR-008: FlashList over FlatList
- **Decision**: Use `@shopify/flash-list` for all long lists.
- **Reason**: 5-10x performance improvement over FlatList for large datasets.
- **Trade-off**: Requires `estimatedItemSize` prop.
