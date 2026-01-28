# Project Architecture

## Overview
This is an Expo-based mobile application called 'expense', likely for expense management. It uses Expo Router for file-based navigation and Supabase for the backend.

## Directory Structure
- `app/`: Contains the application routes (Expo Router).
- `components/`: UI components, with `ui/` for atomic/reusable components.
- `lib/`: Core business logic, hooks, stores, and API clients.
  - `lib/supabase.ts`: Supabase client configuration.
  - `lib/stores/`: Zustand state management.
  - `lib/hooks/`: Custom React hooks.
- `supabase/`: Local Supabase configuration and migrations.
- `assets/`: Static assets like fonts and images.
- `constants/`: Application-wide constants.
- `contexts/`: React context providers.

## Component Architecture
- Uses a atomic design approach with components in `components/ui`.
- Features screen-specific components (e.g., `ExpenseCard`, `GroupCard`).
- Standardized layout components like `ScreenSurface` and `StickyHeader`.
