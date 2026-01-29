# Architecture Overview

The project follows a modular structure organized by concerns (UI, Logic, Routes).

## Directory Structure
- `app/`: Contains the application routes using Expo Router.
    - `(tabs)/`: Main navigation tabs.
    - `(modal)/`: Modal-based screens.
    - `group/[id]/`, `expense/[id]/`: Dynamic routes for specific entities.
    - `api/`: API route handlers (Expo API Routes).
- `components/`: Reusable UI components.
    - `ui/`: Design system atoms and HeroUI-based components.
    - Feature directories: `auth/`, `home/`, `debt-assignment/`, etc.
- `lib/`: Core business logic and integrations.
    - `auth/`: Authentication logic.
    - `stores/`: Zustand store definitions for global state.
    - `hooks/`: Custom React hooks for data fetching (React Query) and UI logic.
    - `utils/`: Helper functions for formatting, calculations, and storage.
    - `types/`: Global TypeScript interfaces and types.
    - `supabase.ts`: Supabase client configuration.
- `contexts/`: React Context providers for global theme and state.
- `supabase/`: Database migrations and configuration.
- `assets/`: Static assets like images and fonts.

## Data Flow
1. **API Layer**: `lib/api-client.ts` handles requests to Supabase or API routes.
2. **Server State**: Managed by `TanStack React Query` hooks in `lib/hooks/`.
3. **Global UI State**: Managed by `Zustand` stores in `lib/stores/`.
4. **Authentication**: Handled via Supabase Auth, exposed through `useAuth` hook.
5. **Real-time**: Real-time updates for notifications and activity using Supabase listeners.
