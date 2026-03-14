# Tech Stack (SplitSmart)

> **Canonical source**: `.agent/rules/01-project-identity.md`
> This Serena memory is a synced cache.

- Framework: Expo (Managed) + Expo Router
- Language: TypeScript (Strict)
- UI: HeroUI Native + Uniwind (Tailwind v4)
- Icons: Lucide React Native
- Animations: Reanimated + Gesture Handler
- Server State: TanStack Query v5
- Global State: Zustand
- Forms: React Hook Form + Zod
- Backend: Supabase (PostgreSQL, Auth, Realtime)
- API: Expo API Routes
- Runtime: Bun

## Project Structure
- `app/`: Routes and API
- `components/`: UI and feature components
- `lib/`: Business logic, hooks, stores, types, utils
- `supabase/`: Migrations
- `docs/`: Guides

## Import Convention
Always use absolute imports with `@/` alias.
Example: `import { ... } from '@/lib/hooks/...'`

