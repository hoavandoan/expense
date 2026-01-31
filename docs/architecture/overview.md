# System Architecture Overview

## High-Level Architecture (C4 Context)

The system consists of a mobile application used by end-users to manage expenses, interacting with a managed backend service (Supabase) for persistence and real-time updates.

```mermaid
graph TB
    User((User))
    
    subgraph "SplitSmart System"
        MobileApp[Mobile Application\n(Expo / React Native)]
        APILayer[API Extensions\n(Expo API Routes)]
    end
    
    subgraph "Supabase Platform"
        Auth[Authentication\n(Supabase Auth)]
        DB[(Database\nPostgreSQL)]
        Realtime[Realtime Service]
        Storage[Storage Bucket]
    end

    User -->|Interacts| MobileApp
    MobileApp -->|HTTPS / REST| APILayer
    MobileApp -->|WebSockets| Realtime
    APILayer -->|Postgres Protocol| DB
    MobileApp -->|HTTPS (Auth)| Auth
    MobileApp -->|Direct Read/Write| DB
```

## Container Architecture

This section details the internal containers and their responsibilities.

### Mobile Application (Frontend)
- **Framework**: Expo (Managed Workflow)
- **Routing**: Expo Router (File-based)
- **State Management**:
    - **Server State**: TanStack React Query (Caching, Synchronization)
    - **UI/Global State**: Zustand (Session, Theme, Temporary State)
- **UI library**: HeroUI Native + Uniwind (Tailwind CSS)

### Backend Services (Supabase & API)
The backend is primarily "Serverless" via Supabase, supplemented by Expo API Routes for specific logic that requires trusted execution.

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| **Database** | PostgreSQL 15+ | Primary data store. relational data (Users, Groups, Expenses). |
| **Auth** | GoTrue (Supabase) | Identity provider (Email/Password, OAuth). Handles JWT issuance. |
| **Realtime** | Supabase Realtime | Broadcasts database changes (Inserts/Updates) to connected clients. |
| **API API** | Expo API Routes | Server-side endpoints for sensitive logic (if any) or complex aggregations. |

## Deployment Strategy

### Mobile Deployment (Expo)
- **Build Service**: EAS Build (Expo Application Services)
- **Updates**: EAS Update (Over-the-air updates) - *Supported*
- **Environments**:
    - **Development**: `bun run dev` (Local Simulator/Device via Expo Go)
    - **Production**: Native Builds (`.apk`, `.ipa`) via EAS

### Backend Infrastructure (Supabase)
- **Hosting**: Managed Cloud (Supabase.com)
- **Region**: *User Configured*
- **Configuration**:
    - **RLS (Row Level Security)**: MANDATORY. All tables must have RLS policies enabled.
    - **Migrations**: SQL-based migrations managed via Supabase CLI (if local dev enabled).
