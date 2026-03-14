# Architecture Overview

> **Canonical source**: `.agent/context/architecture.md`
> This Serena memory is a synced cache. Update the canonical file first, then sync here.

# Product Context
**SplitSmart (Expense)** is a mobile application designed to simplify expense sharing among groups (roommates, travelers, friends).
- **Core Goal**: Track shared expenses, calculate debts, and settle up with VietQR.
- **Target Audience**: Roommates, travelers, and social groups.
- **Key Workflows**: Group management, multi-mode expense splitting, automated debt calculation, and payment confirmation.

## Frontend Architecture
- Framework: Expo
- Routing: Expo Router
- Server State: TanStack Query v5
- Global State: Zustand
- UI: HeroUI Native / Uniwind (Tailwind CSS)

## Backend Architecture
- Database: PostgreSQL (Supabase)
- Auth: Supabase Auth
- Realtime: Supabase Realtime
- API Logic: Expo API Routes

## Security
- RLS enabled on all tables.
- JWT for auth.
- Zod validation for API routes.

