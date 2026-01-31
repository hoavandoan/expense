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
    - `api-client.ts`: Enhanced `fetch` wrapper for calling Expo API routes with automatic authentication.
    - `auth/`: Authentication logic and OAuth configurations.
    - `stores/`: Zustand store definitions for global state (Auth, Groups, UI).
    - `hooks/`: Custom React hooks using TanStack React Query for data fetching and mutations.
    - `utils/`: Helper functions for debt calculations, formatting, and local storage.
    - `types/`: Global TypeScript interfaces and Zod schemas.
    - `supabase.ts`: Client configuration for Supabase.
    - `supabase-server.ts`: Server-side Supabase client for API routes.
- `contexts/`: React Context providers for global theme and state.
- `supabase/`: Database migrations and configuration.
- `assets/`: Static assets like images and fonts.

## Data Flow
1. **API Layer**: `lib/api-client.ts` handles requests to Supabase or API routes.
2. **Server State**: Managed by `TanStack React Query` hooks in `lib/hooks/`.
3. **Global UI State**: Managed by `Zustand` stores in `lib/stores/`.
4. **Authentication**: Handled via Supabase Auth, exposed through `useAuth` hook.
5. **Real-time**: Real-time updates for notifications and activity using Supabase listeners.
