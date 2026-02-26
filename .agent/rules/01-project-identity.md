---
trigger: always_on
---

# Project Identity — SplitSmart (Expense)

A group expense management mobile app built with Expo (React Native).

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo (Managed Workflow) + Expo Router |
| **Language** | TypeScript (strict mode) |
| **UI Library** | HeroUI Native + Uniwind (Tailwind CSS for RN) |
| **Icons** | Lucide React Native |
| **Animations** | react-native-reanimated + react-native-gesture-handler |
| **State (Server)** | TanStack React Query v5 |
| **State (Global)** | Zustand |
| **Forms** | react-hook-form + Zod validation |
| **Backend** | Supabase (Auth + PostgreSQL + Realtime) |
| **API Layer** | Expo API Routes (`app/api/`) + `lib/api-client.ts` |
| **Runtime** | Bun |

## Project Structure

```
app/                    # Expo Router file-based routes
├── (tabs)/             # Main tab navigation (Home, Activity, Plus, Settings)
├── (modal)/            # Modal screens (add-expense, add-group, settle-up, join-group)
├── group/[id]/         # Dynamic group routes (expenses, settings)
├── expense/[id]/       # Dynamic expense detail
├── api/                # Expo API Routes (server-side)
├── notifications/      # Notification screens
└── _layout.tsx         # Root layout

components/             # Reusable UI
├── ui/                 # Design system atoms (HeroUI wrappers)
├── home/               # Home screen components
├── auth/               # Auth-related components
├── debt-assignment/    # Debt assignment UI
└── parallax-header/    # Scroll header animation

lib/                    # Core business logic
├── hooks/              # TanStack Query hooks (12 files)
├── stores/             # Zustand stores (auth, groups, ui)
├── types/              # TypeScript interfaces & Zod schemas
├── utils/              # Helpers (debt calc, formatting, storage)
├── api-client.ts       # Enhanced fetch with auth
├── supabase.ts         # Client-side Supabase config
└── supabase-server.ts  # Server-side Supabase config

contexts/               # React Context providers
supabase/               # DB migrations
docs/                   # Human-readable documentation
```

## Import Convention

Always use absolute imports with `@/` alias:
```typescript
import { useGroups } from '@/lib/hooks/use-groups';
import { Button } from '@heroui/button';
```

## Data Models (Key Interfaces)

`User`, `Group`, `GroupMember`, `Expense`, `ExpenseSplit`, `Settlement`, `Debt`, `DebtAssignment`, `DebtAssignmentRequest`, `ActivityLog`, `Notification`, `UserBalance`, `GroupWithDetails`

All defined in `lib/types/index.ts`.

## Developer Onboarding

### Prerequisites
- **Runtime**: [Bun](https://bun.sh/) (Mandatory)
- **Framework**: Node.js (LTS), EAS CLI (`npm install -g eas-cli`)
- **App**: [Expo Go](https://expo.dev/go) on physical device or Simulator

### Setup & Dev
1. **Install**: `bun install`
2. **Environment**: Configure `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. **Execute**:
   - `bun run dev` (Start dev server)
   - `bun run ios` / `bun run android`
   - `bun run lint` (Check types and linting)
